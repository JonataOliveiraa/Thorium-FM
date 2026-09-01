import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { MiscHelper } from './../Global/Utils/MiscHelper.js';

const { Rectangle, Vector2 } = Modules;
const { Main, Lighting } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const GetColor = Lighting['Color GetColor(int x, int y)'];

const MAX_PROJ = Terraria.Main.maxProjectiles ?? 1000;
const _rotation = new Float32Array(MAX_PROJ);
const _frame = new Int8Array(MAX_PROJ);
const _attacking = new Uint8Array(MAX_PROJ);

export class AntlionStaffPro extends ModProjectile {
    static MUZZLE_Y = -26;
    static RANGE_SQ = 160000;
    static ROT_STEP = 0.0075;
    static ROT_MAX = 0.14;
    static WINDUP = 70;
    static FIRE_AT = 80;
    static SHOT_SPEED = 12;
    static SHOT_GRAVITY = 0.1;
    static LEAD = 0.7;
    static EFFECT_FRAMES = 4;
    static FALL_CAP = 16;
    static RETARGET_RATE = 10;
    static GRAVITY = 1;
    static GROUND_SEARCH = 40;
    static EMBED_LIFT = 4;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.shotType = -1;
        this.effect = null;
        this.effectTried = false;
    }

    SetDefaults() {
        this.Projectile.width = 36;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = -1;
        this.Projectile.hide = false;
        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
    }

    OnSpawn(proj) {
        const slot = proj.whoAmI;
        _rotation[slot] = 0;
        _frame[slot] = 0;
        _attacking[slot] = 0;
    }

    Muzzle(proj) {
        return Vector2.new(proj.Center.X, proj.Center.Y + AntlionStaffPro.MUZZLE_Y);
    }

    AI(proj) {
        const slot = proj.whoAmI;
        const ai = new ProjAI(proj, false);

        const local = new ProjAI(proj, true);
        if (local[2] === 0) {
            local[2] = 1;
            this.SnapToGround(proj);
        }
        this.Settle(proj);

        const muzzle = this.Muzzle(proj);
        const target = this.FindTarget(proj, muzzle, ai, local);

        if (!target) {
            _rotation[slot] = 0;
            _frame[slot] = 0;
            proj.frameCounter = 0;
        } else {
            this.AimAndFire(proj, slot, ai, muzzle, target);
        }

        this.Animate(proj, slot);
    }

    FindTarget(proj, muzzle, ai, local) {
        const npcs = Main.npc;

        const stored = ai[0] - 1;
        if (stored >= 0 && local[1]-- > 0) {
            const kept = npcs[stored];
            if (kept && kept.active && kept.CanBeChasedBy(null, false)
                && kept.DistanceSQ(muzzle) < AntlionStaffPro.RANGE_SQ) {
                return kept;
            }
        }

        local[1] = AntlionStaffPro.RETARGET_RATE;

        const mx = (muzzle.X / 16) | 0;
        const my = (muzzle.Y / 16) | 0;
        let best = null;
        let bestDist = AntlionStaffPro.RANGE_SQ;

        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            const npc = npcs[i];
            if (!npc || !npc.active) continue;

            const dist = npc.DistanceSQ(muzzle);
            if (dist >= bestDist) continue;
            if (!npc.CanBeChasedBy(null, false)) continue;

            const center = npc.Center;
            const visible = CanHit(muzzle, 1, 1, center, 1, 1)
                || MiscHelper.CanHitLine(mx, my, (center.X / 16) | 0, (center.Y / 16) | 0);
            if (!visible) continue;

            bestDist = dist;
            best = npc;
        }

        ai[0] = best ? best.whoAmI + 1 : 0;
        return best;
    }

    AimAndFire(proj, slot, ai, muzzle, npc) {
        const dir = proj.Center.X < npc.Center.X ? 1 : -1;
        _rotation[slot] += AntlionStaffPro.ROT_STEP * dir;
        if (Math.abs(_rotation[slot]) > AntlionStaffPro.ROT_MAX) {
            _rotation[slot] = dir * AntlionStaffPro.ROT_MAX;
        }

        ai[1] = ai[1] + 1;
        if (ai[1] >= AntlionStaffPro.WINDUP) _attacking[slot] = 1;
        if (ai[1] < AntlionStaffPro.FIRE_AT) return;

        ai[1] = 0;
        if (Main.myPlayer !== proj.owner) return;

        if (this.shotType === -1) {
            this.shotType = ModProjectile.getTypeByName('AntlionStaffPro2') ?? -2;
        }
        if (this.shotType < 0) return;

        const npcVel = npc.velocity;
        const targetPos = Vector2.new(
            npc.Center.X + npcVel.X * AntlionStaffPro.LEAD,
            npc.Center.Y + npcVel.Y * AntlionStaffPro.LEAD
        );

        let vx = targetPos.X - muzzle.X;
        let vy = targetPos.Y - muzzle.Y;
        const len = Math.sqrt(vx * vx + vy * vy) || 1;
        if (len > AntlionStaffPro.SHOT_SPEED) {
            const scale = AntlionStaffPro.SHOT_SPEED / len;
            vx *= scale;
            vy *= scale;
        }

        const shot = { X: vx, Y: vy };
        if (Math.abs(vx) > 0.05) {
            MiscHelper.ModifyVelocityForGravity(muzzle, targetPos, AntlionStaffPro.SHOT_GRAVITY, shot);
        }

        NewProjectile(null, muzzle, Vector2.new(shot.X, shot.Y), this.shotType,
            proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null);
    }

    Animate(proj, slot) {
        if (!_attacking[slot]) return;

        proj.frameCounter++;
        if (proj.frameCounter <= 6) return;

        _frame[slot]++;
        if (_frame[slot] >= 3) {
            _attacking[slot] = 0;
            _frame[slot] = 0;
        }
        proj.frameCounter = 0;
    }

    SnapToGround(proj) {
        const tileX = Math.floor(proj.Center.X / 16);
        const startY = Math.floor((proj.position.Y + proj.height) / 16);

        for (let i = -AntlionStaffPro.EMBED_LIFT; i < AntlionStaffPro.GROUND_SEARCH; i++) {
            const tileY = startY + i;
            if (!MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) continue;
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            return;
        }
    }

    Settle(proj) {
        const vel = proj.velocity;
        if (vel.Y === 0) return;

        const vy = Math.min(vel.Y + AntlionStaffPro.GRAVITY, AntlionStaffPro.FALL_CAP);
        const tileX = Math.floor(proj.Center.X / 16);
        const tileY = Math.floor((proj.position.Y + proj.height + vy) / 16);

        if (MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) {
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            return;
        }

        proj.velocity = Vector2.new(vel.X, vy);
    }

    GetAlpha(proj, color) {
        return GetColor((proj.Center.X / 16) | 0, ((proj.Center.Y - 38) / 16) | 0);
    }

    PostDraw(proj, lightColor) {
        if (!this.effectTried) {
            this.effectTried = true;
            const base = this.Texture.startsWith('Textures/') ? this.Texture : 'Textures/' + this.Texture;
            const path = base + '_Effect.png';
            try {
                if (tl.file.exists(path)) this.effect = tl.texture.load(path);
                else tl.log('[Thorium] efeito nao encontrado: ' + path);
            } catch (e) {
                tl.log('[Thorium] falha ao carregar ' + path + ': ' + e);
            }
        }
        if (!this.effect) return;

        const slot = proj.whoAmI;
        const frameH = (this.effect.Height / AntlionStaffPro.EFFECT_FRAMES) | 0;
        const source = Rectangle.new(0, _frame[slot] * frameH, this.effect.Width, frameH);
        const pos = Vector2.Subtract(proj.Center, Main.screenPosition);

        Main[ENTITY_DRAW](
            this.effect, pos, source,
            proj['Color GetAlpha(Color newColor)'](lightColor),
            _rotation[slot], Vector2.new(16, 38), proj.scale, null, 0
        );
    }
}
