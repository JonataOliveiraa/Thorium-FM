import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Color, Rand, Vector2 } = Modules;
const { Main, Lighting } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const GetColor = Lighting['Color GetColor(int x, int y)'];

const FRAMES = 5;

const FRAME_DURATIONS = [122, 3, 15, 5, 5];

const DUST_DEVOURER = 46;

const GRAVITY = 1;
const MAX_FALL = 16;
const GROUND_SEARCH = 40;
const EMBED_LIFT = 4;

const MUZZLE_Y = -18;
const LIGHT_OFFSET_Y = -38;
const RANGE_SQ = 160000;
const FIRE_AT = 125;

const RETARGET_RATE = 10;

const SPAWN_DUST_COUNT = 15;
const SPAWN_DUST_SPEED = 4;
const SPAWN_DUST_ALPHA = 125;
const SPAWN_DUST_SCALE = 1.4;

const RING_DUST_COUNT = 20;
const RING_RADIUS_X = 2;
const RING_RADIUS_Y = 8;
const RING_OFFSET_Y = -14;
const RING_DUST_ALPHA = 175;
const RING_DUST_SCALE = 1;
const RING_DUST_SPEED = 1;
const RING_STEP = Math.PI * 2 / RING_DUST_COUNT;

const RING_ROTATION = Math.PI / 2;
const RING_ROTATION_COS = Math.cos(RING_ROTATION);
const RING_ROTATION_SIN = Math.sin(RING_ROTATION);

const EGG_SPREAD_X = 0.1;
const EGG_SPEED_Y = -8;

let _eggType = -1;

export class DevourerStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 46;
        this.Projectile.height = 58;
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
        new ProjAI(proj, false)[0] = 0;
        new ProjAI(proj, true)[1] = 0;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);
        if (local[0] === 0) {
            local[0] = 1;

            this.SnapToGround(proj);
            this.SpawnBurst(proj);
        }

        this.Settle(proj);

        const ai = new ProjAI(proj, false);
        const center = proj.Center;
        const muzzle = Vector2.new(center.X, center.Y + MUZZLE_Y);

        const target = this.FindTarget(center, muzzle, ai, local);
        if (!target) return;

        ai[1] = ai[1] + 1;

        this.Animate(proj, ai);

        if (ai[1] !== FIRE_AT) return;

        if (!CanHit(muzzle, 1, 1, target.Center, 1, 1)) return;

        this.SpitRing(proj);
        if (Main.myPlayer !== proj.owner) return;

        if (_eggType === -1) _eggType = ModProjectile.getTypeByName('DevourerStaffPro2') ?? -2;
        if (_eggType < 0) return;

        NewProjectile(
            null,
            muzzle, Vector2.new(Rand.NextFloat(-EGG_SPREAD_X, EGG_SPREAD_X), EGG_SPEED_Y),
            _eggType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null
        );
    }

    SpawnBurst(proj) {
        for (let i = 0; i < SPAWN_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.Center, 0, 0, DUST_DEVOURER,
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                SPAWN_DUST_ALPHA, Color.Transparent, SPAWN_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }

    SpitRing(proj) {
        const center = proj.Center;

        for (let i = 0; i < RING_DUST_COUNT; i++) {
            const angle = i * RING_STEP;
            const localX = Math.sin(angle) * RING_RADIUS_X;
            const localY = -Math.cos(angle) * RING_RADIUS_Y;

            const offX = localX * RING_ROTATION_COS - localY * RING_ROTATION_SIN;
            const offY = localX * RING_ROTATION_SIN + localY * RING_ROTATION_COS;

            const dust = NewDustDirect(
                center, 0, 0, DUST_DEVOURER, 0, 0,
                RING_DUST_ALPHA, Color.Transparent, RING_DUST_SCALE
            );
            if (!dust) continue;

            dust.noGravity = true;
            dust.position = Vector2.new(center.X + offX, center.Y + RING_OFFSET_Y + offY);

            const len = Math.sqrt(offX * offX + offY * offY);
            dust.velocity = len > 0
                ? Vector2.new(offX / len * RING_DUST_SPEED, offY / len * RING_DUST_SPEED)
                : Vector2.new(0, RING_DUST_SPEED);
        }
    }

    FindTarget(center, muzzle, ai, local) {
        const npcs = Main.npc;

        const stored = ai[0] - 1;
        if (stored >= 0 && local[1]-- > 0) {
            const kept = npcs[stored];
            if (kept && kept.active && kept.CanBeChasedBy(null, false)
                && kept.DistanceSQ(center) < RANGE_SQ) {
                return kept;
            }
        }

        local[1] = RETARGET_RATE;

        const maxNPCs = Main.maxNPCs;
        let best = null;
        let bestDist = RANGE_SQ;

        for (let i = 0; i < maxNPCs; i++) {
            const npc = npcs[i];

            if (!npc || !npc.active) continue;

            const dist = npc.DistanceSQ(center);
            if (dist >= bestDist) continue;
            if (!npc.CanBeChasedBy(null, false)) continue;
            if (!CanHit(muzzle, 1, 1, npc.Center, 1, 1)) continue;

            bestDist = dist;
            best = npc;
        }

        ai[0] = best ? best.whoAmI + 1 : 0;
        return best;
    }

    Animate(proj, ai) {
        let frame = proj.frame;
        let counter = proj.frameCounter + 1;

        if (counter > FRAME_DURATIONS[frame]) {
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

    GetAlpha(proj, color) {
        const center = proj.Center;
        return GetColor((center.X / 16) | 0, ((center.Y + LIGHT_OFFSET_Y) / 16) | 0);
    }
}
