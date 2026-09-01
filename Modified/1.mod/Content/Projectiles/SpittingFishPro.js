import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;
const { Main, WorldGen } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const InWorld = WorldGen['bool InWorld(int x, int y, int fluff)'];

const FRAMES = 4;
const FRAME_RATE = 6;
const IDLE_FRAME = 2;

const FIRE_DELAY = 30;
const RANGE_SQ = 160000;

const EYE_Y = -4;
const MUZZLE_X = 8;
const SHOT_SPEED = 5.5;
const SHOT_GRAVITY = 0.1;
const SHOT_FREE_TICKS = 14;
const MIN_HORIZONTAL = 0.05;

const RISE_SPEED = -0.01;
const SINK_SPEED = 0.01;
const FULL_LIQUID = 255;

const HOVER_STEP = 15;
const HOVER_END = 30;

let _shotType = -1;

export class SpittingFishPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 46;
        this.Projectile.height = 34;
        this.Projectile.aiStyle = -1;
        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
    }

    AI(proj) {
        if (proj.wet) {
            const vel = proj.velocity;
            proj.velocity = Vector2.new(vel.X, vel.Y + RISE_SPEED);
        } else {
            this.Settle(proj);
            this.Attack(proj);
        }

        this.Hover(proj);
    }

    Settle(proj) {
        const center = proj.Center;
        const x = Math.floor(center.X / 16);
        const y = Math.floor(center.Y / 16) + 2;

        let floating = false;
        if (InWorld(x, y, 0)) {
            const tile = Main.tile.get_Item(x, y);
            floating = !!tile && tile.liquid >= FULL_LIQUID;
        }

        proj.velocity = Vector2.new(proj.velocity.X, floating ? 0 : SINK_SPEED);
    }

    Attack(proj) {
        const center = proj.Center;
        const eye = Vector2.new(center.X, center.Y + EYE_Y);
        const target = this.FindTarget(proj, center, eye);

        if (!target) {
            proj.frame = IDLE_FRAME;
            proj.frameCounter = 0;
            return;
        }

        proj.spriteDirection = target.Center.X > center.X ? 1 : -1;

        proj.frameCounter++;
        if (proj.frameCounter > FRAME_RATE) {
            proj.frame++;
            if (proj.frame >= FRAMES) proj.frame = 0;
            proj.frameCounter = 0;
        }

        const ai = new ProjAI(proj, false);
        ai[0]++;
        if (ai[0] <= FIRE_DELAY) return;

        ai[0] = 0;
        proj.frame = 0;

        if (Main.myPlayer === proj.owner) this.Spit(proj, eye, target);
    }

    FindTarget(proj, center, eye) {
        const npcs = Main.npc;
        const topY = proj.position.Y;

        let best = null;
        let bestDist = RANGE_SQ;

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = npcs[i];
            if (!npc || !npc.active) continue;
            if (npc.position.Y >= topY) continue;

            const dist = npc.DistanceSQ(center);
            if (dist >= bestDist) continue;
            if (!npc.CanBeChasedBy(null, false)) continue;
            if (!CanHit(eye, 1, 1, npc.Center, 1, 1)) continue;

            bestDist = dist;
            best = npc;
        }

        return best;
    }

    Spit(proj, eye, target) {
        if (_shotType < 0) _shotType = ModProjectile.getTypeByName('SpittingFishPro2') ?? -1;
        if (_shotType < 0) return;

        const muzzle = Vector2.new(eye.X + proj.spriteDirection * MUZZLE_X, eye.Y);
        const goal = target.Center;

        let vx = goal.X - muzzle.X;
        let vy = goal.Y - muzzle.Y;

        const len = Math.sqrt(vx * vx + vy * vy);
        if (len > SHOT_SPEED) {
            const scale = SHOT_SPEED / len;
            vx *= scale;
            vy *= scale;
        }

        if (Math.abs(vx) > MIN_HORIZONTAL) {
            const shot = { X: vx, Y: vy };
            MiscHelper.ModifyVelocityForGravity(muzzle, goal, SHOT_GRAVITY, shot, SHOT_FREE_TICKS);
            vx = shot.X;
            vy = shot.Y;
        }

        NewProjectile(
            null,
            muzzle, Vector2.new(vx, vy),
            _shotType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null
        );
    }

    Hover(proj) {
        const local = new ProjAI(proj, true);

        const amount = local[0] + 1;
        local[0] = amount;

        const rising = local[1] === 1;
        if (amount % HOVER_STEP === 0) {
            const pos = proj.position;
            proj.position = Vector2.new(pos.X, pos.Y + (rising ? -1 : 1));
        }

        if (amount <= HOVER_END) return;

        local[0] = 0;
        local[1] = rising ? 0 : 1;
    }
}
