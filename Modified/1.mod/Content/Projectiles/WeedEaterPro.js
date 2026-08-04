import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const PHASE_IDLE = 0;
const PHASE_CHARGING = 1;
const PHASE_ATTACKING = 2;

const CHARGE_AT = 30;
const ATTACK_AT = 70;
const SHOOT_AT = 80;
const CYCLE_END = 90;
const CYCLE_RESET = -30;

const RANGE_SQ = 562500;
const RETARGET_RATE = 10;
const SHOT_SPEED = 9;

const GRAVITY = 1;
const MAX_FALL = 16;
const GROUND_SEARCH = 40;
const EMBED_LIFT = 4;

const FRAMES = 17;
const DRAW_OFFSET_X = -10;
const DUST_GORE = 5;
const DUST_LEAF = 39;

let _shotType = -1;

export class WeedEaterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._origin = null;
        this._frames = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 56;
        this.Projectile.height = 54;
        this.Projectile.aiStyle = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.sentry = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);

        if (localAI[2] === 0) {
            localAI[2] = 1;
            this._snapToGround(proj);
        }
        this._settle(proj);

        const target = this._getTarget(proj, ai, localAI);

        if (!target) {
            localAI[0] = PHASE_IDLE;
            ai[1] = CYCLE_RESET;
            this._animate(proj, PHASE_IDLE, false);
            return;
        }

        ai[1]++;
        proj.spriteDirection = target.Center.X < proj.Center.X ? 1 : -1;

        if (ai[1] >= CHARGE_AT) localAI[0] = PHASE_CHARGING;
        if (ai[1] >= ATTACK_AT) localAI[0] = PHASE_ATTACKING;

        if (ai[1] === SHOOT_AT && Main.myPlayer === proj.owner) this._shoot(proj, target);

        if (ai[1] > CYCLE_END) {
            localAI[0] = PHASE_IDLE;
            ai[1] = CYCLE_RESET;
        }

        this._animate(proj, localAI[0], true);
    }

    _snapToGround(proj) {
        const tileX = Math.floor(proj.Center.X / 16);
        const startY = Math.floor((proj.position.Y + proj.height) / 16);

        for (let i = -EMBED_LIFT; i < GROUND_SEARCH; i++) {
            const tileY = startY + i;
            if (!MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) continue;
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            return;
        }
    }

    _settle(proj) {
        const vel = proj.velocity;
        if (vel.Y === 0) return;

        vel.Y = Math.min(vel.Y + GRAVITY, MAX_FALL);

        const tileX = Math.floor(proj.Center.X / 16);
        const tileY = Math.floor((proj.position.Y + proj.height + vel.Y) / 16);

        if (MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) {
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            return;
        }

        proj.velocity = vel;
    }

    _getTarget(proj, ai, localAI) {
        const stored = ai[0] - 1;
        if (stored >= 0 && localAI[1]-- > 0) {
            const kept = Main.npc[stored];
            if (kept && kept.active && kept.CanBeChasedBy(proj, false)) return kept;
        }

        localAI[1] = RETARGET_RATE;
        const center = proj.Center;
        const npcs = Main.npc;
        let best = null;
        let bestDist = RANGE_SQ;

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = npcs[i];
            if (!npc.active || !npc.CanBeChasedBy(proj, false)) continue;

            const dx = npc.Center.X - center.X;
            const dy = npc.Center.Y - center.Y;
            const dist = dx * dx + dy * dy;
            if (dist >= bestDist) continue;
            if (!CanHit(proj.position, proj.width, proj.height, npc.position, npc.width, npc.height)) continue;

            bestDist = dist;
            best = npc;
        }

        ai[0] = best ? best.whoAmI + 1 : 0;
        return best;
    }

    _shoot(proj, target) {
        if (_shotType < 0) _shotType = ModProjectile.getTypeByName('WeedEaterPro2') ?? -1;
        if (_shotType < 0) return;

        const center = proj.Center;
        const dx = target.Center.X - center.X;
        const dy = target.Center.Y + 4 - center.Y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = len > SHOT_SPEED ? SHOT_SPEED / len : 1;

        NewProjectile(
            proj.GetProjectileSource_FromThis(),
            center.X + proj.spriteDirection * 10, center.Y - 4,
            dx * scale, dy * scale,
            _shotType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null
        );
    }

    _animate(proj, phase, aggro) {
        if (phase === PHASE_ATTACKING) {
            if (proj.frame < 13) proj.frame = 13;
            if (++proj.frameCounter <= 3) return;
            if (++proj.frame >= 16) proj.frame = 16;
            proj.frameCounter = 0;
            return;
        }

        if (phase === PHASE_CHARGING) {
            if (proj.frame < 8) proj.frame = 8;
            if (++proj.frameCounter <= 4) return;
            if (++proj.frame > 12) proj.frame = 11;
            proj.frameCounter = 0;
            return;
        }

        if (proj.frame >= 8) proj.frame = 0;
        if (++proj.frameCounter <= (aggro ? 6 : 10)) return;
        if (++proj.frame > 7) proj.frame = 0;
        proj.frameCounter = 0;
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return true;

        if (!this._frames) {
            const frameHeight = texture.Height / FRAMES;
            this._origin = Vector2.new(texture.Width * 0.5, frameHeight * 0.5);
            this._frames = [];
            for (let i = 0; i < FRAMES; i++) {
                this._frames.push(Rectangle.new(0, i * frameHeight, texture.Width, frameHeight));
            }
        }

        const source = this._frames[proj.frame] ?? this._frames[0];
        const flipped = proj.spriteDirection === -1;
        const center = proj.Center;

        Main.spriteBatch[DRAW](
            texture,
            Vector2.new(
                center.X - Main.screenPosition.X + DRAW_OFFSET_X * proj.spriteDirection,
                center.Y - Main.screenPosition.Y + proj.gfxOffY
            ),
            source,
            proj.GetAlpha(lightColor),
            proj.rotation, this._origin, proj.scale,
            flipped ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0
        );

        return false;
    }

    OnKill(proj, timeLeft) {
        if (Main.netMode === 2) return;
        for (let i = 0; i < 5; i++) {
            Effects.NewDust(proj.position, proj.width, proj.height, DUST_LEAF, 0, -2.5, 0, Color.White, 1);
            Effects.NewDust(proj.position, proj.width, proj.height, DUST_GORE, 0, -2.5, 0, Color.White, 1);
        }
    }
}
