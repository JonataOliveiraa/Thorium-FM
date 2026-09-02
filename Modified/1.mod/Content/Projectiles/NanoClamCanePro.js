import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { MathHelper, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const FRAMES = 4;
const FRAME_RATE = 4;

const RANGE = 350;
const SEARCH_EVERY = 10;

const OPEN_AT = 48;
const FIRE_AT = 60;

const PEARLS = 3;
const SPREAD = MathHelper.ToRadians(8);
const SHOT_SPEED = 10;

const LIGHT_R = 0.01;
const LIGHT_G = 0.1;
const LIGHT_B = 0.15;

const GRAVITY = 0.2;
const MAX_FALL = 16;
const GROUND_SEARCH = 40;
const EMBED_LIFT = 4;

let _pearlType = -1;

export class NanoClamCanePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 34;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
    }

    OnSpawn(proj) {
        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);
        ai[0] = 0;
        ai[1] = 0;
        local[0] = 0;
        local[1] = 0;
        local[2] = 0;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);
        if (local[2] === 0) {
            local[2] = 1;
            this.SnapToGround(proj);
        }

        Effects.AddLight(proj.Center, LIGHT_R, LIGHT_G, LIGHT_B);
        this.Settle(proj);

        const ai = new ProjAI(proj, false);
        const target = this.Nearest(proj, local);

        if (target) this.Cycle(proj, ai, target);

        this.Animate(proj, ai);
    }

    Nearest(proj, local) {
        if (local[1] > 0) {
            local[1] = local[1] - 1;

            const cached = local[0] | 0;
            if (cached > 0) {
                const npc = Main.npc[cached - 1];
                if (npc && npc.active && npc.CanBeChasedBy(proj, false)) return npc;
            }
            return null;
        }

        local[1] = SEARCH_EVERY;

        const found = FindTargetWithinRange(proj, RANGE, true);
        const valid = found && found.active ? found : null;

        local[0] = valid ? valid.whoAmI + 1 : 0;
        return valid;
    }

    Cycle(proj, ai, target) {
        ai[0] = ai[0] + 1;

        if (ai[0] === OPEN_AT) ai[1] = 1;
        if (ai[0] < FIRE_AT) return;

        ai[0] = 0;
        if (Main.myPlayer !== proj.owner) return;

        this.Spit(proj, target);
    }

    Spit(proj, target) {
        if (_pearlType === -1) _pearlType = ModProjectile.getTypeByName('NanoClamCaneProPearl') ?? -2;
        if (_pearlType < 0) return;

        const center = proj.Center;
        const goal = target.Center;

        let vx = goal.X - center.X;
        let vy = goal.Y - center.Y;

        const len = Math.sqrt(vx * vx + vy * vy);
        if (len > SHOT_SPEED) {
            const scale = SHOT_SPEED / len;
            vx *= scale;
            vy *= scale;
        }

        const aim = Vector2.new(vx, vy);

        for (let i = 0; i < PEARLS; i++) {
            const angle = MathHelper.Lerp(-SPREAD, SPREAD, i / (PEARLS - 1));
            const shot = Vector2.RotatedBy(aim, angle);

            NewProjectile(
                null,
                center, shot,
                _pearlType, proj.damage, proj.knockBack, proj.owner,
                i === 0 ? 1 : 0, 0, 0, null
            );
        }
    }

    Animate(proj, ai) {
        if (ai[1] !== 1) {
            proj.frame = 0;
            proj.frameCounter = 0;
            return;
        }

        let frame = proj.frame;
        let counter = proj.frameCounter + 1;

        if (counter > FRAME_RATE) {
            frame++;
            counter = 0;
        }

        if (frame >= FRAMES) {
            frame = 0;
            ai[1] = 0;
        }

        proj.frame = frame;
        proj.frameCounter = counter;
    }

    SnapToGround(proj) {
        const position = proj.position;
        const height = proj.height;
        const tileX = Math.floor(proj.Center.X / 16);
        const startY = Math.floor((position.Y + height) / 16);

        for (let i = -EMBED_LIFT; i < GROUND_SEARCH; i++) {
            const tileY = startY + i;
            if (!MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) continue;
            proj.position = Vector2.new(position.X, tileY * 16 - height);
            proj.velocity = Vector2.Zero;
            return;
        }
    }

    Settle(proj) {
        const vel = proj.velocity;
        if (vel.Y === 0) return;

        const position = proj.position;
        const height = proj.height;
        const vy = Math.min(vel.Y + GRAVITY, MAX_FALL);
        const tileX = Math.floor(proj.Center.X / 16);
        const tileY = Math.floor((position.Y + height + vy) / 16);

        if (MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) {
            proj.position = Vector2.new(position.X, tileY * 16 - height);
            proj.velocity = Vector2.Zero;
            return;
        }

        proj.velocity = Vector2.new(vel.X, vy);
    }
}
