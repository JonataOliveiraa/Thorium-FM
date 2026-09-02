import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Main } = Terraria;
const { Color, Rand, Vector2 } = Modules;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FRAMES = 4;
const LIFETIME = 300;
const DESPAWN_TICKS = 30;

const FADE_IN_STEP = 51;
const FADE_OUT_STEP = 8;

const HOVER_Y = 32;
const FLY_SPEED = 4;
const ARRIVE_SQ = 256;
const PLAYER_ARRIVE_SQ = 256;

const SPAWN_SIDE_OFFSET = 64;
const SPAWN_SCATTER = 24;

const SPAWN_DUST = 31;
const SPAWN_DUST_COUNT = 30;
const SPAWN_DUST_ALPHA = 50;
const SPAWN_DUST_SCALE = 1.25;
const SPAWN_DUST_SPREAD = 1.4;

const ATTACHED_X_OFFSET = 4;
const LIGHT_LERP = 0.4;

const RISE_ACCEL = 0.05;
const RISE_CAP = -1;
const RISE_DRAG = 0.96;
const CARRY_FACTOR = 0.8;
const MIN_DRIFT = 0.5;

const JUMP_FLAGS = [
    'canJumpAgain_Cloud',
    'canJumpAgain_Sandstorm',
    'canJumpAgain_Blizzard',
    'canJumpAgain_Fart',
    'canJumpAgain_Sail',
    'canJumpAgain_Unicorn',
    'canJumpAgain_Santank',
    'canJumpAgain_WallOfFleshGoat',
    'canJumpAgain_Basilisk'
];

const MAX_PROJ = Main.maxProjectiles ?? 1000;
const _targetX = new Float32Array(MAX_PROJ);
const _targetY = new Float32Array(MAX_PROJ);
const _attachTimer = new Int16Array(MAX_PROJ);
const _arrived = new Uint8Array(MAX_PROJ);
const _wingTime = new Float32Array(MAX_PROJ);
const _jumpMask = new Uint16Array(MAX_PROJ);
const _restore = new Uint8Array(MAX_PROJ);

export class ZephyrsGripHatchlingPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 74;
        this.Projectile.height = 44;
        this.Projectile.netImportant = true;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
    }

    OnSpawn(proj) {
        const i = proj.whoAmI;
        const center = proj.Center;

        _targetX[i] = center.X;
        _targetY[i] = center.Y;
        _attachTimer[i] = 0;
        _arrived[i] = 0;
        _wingTime[i] = 0;
        _jumpMask[i] = 0;
        _restore[i] = 0;

        const player = Main.player[proj.owner];
        const side = Math.sign(player.Center.X - center.X) || 1;

        proj.position = Vector2.new(
            proj.position.X + side * SPAWN_SIDE_OFFSET + Rand.NextFloat(-SPAWN_SCATTER, SPAWN_SCATTER),
            proj.position.Y - HOVER_Y * 2 + Rand.NextFloat(-SPAWN_SCATTER, SPAWN_SCATTER)
        );

        const toTarget = Vector2.Subtract(center, proj.Center);
        const length = toTarget['float Length()']();
        proj.velocity = length > 0
            ? Vector2.new(toTarget.X / length * FLY_SPEED, toTarget.Y / length * FLY_SPEED)
            : Vector2.Zero;

        for (let d = 0; d < SPAWN_DUST_COUNT; d++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, SPAWN_DUST,
                proj.velocity.X * 0.5, proj.velocity.Y * 0.5,
                SPAWN_DUST_ALPHA, Color.White, SPAWN_DUST_SCALE
            );
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, SPAWN_DUST_SPREAD);
            dust.noGravity = true;
        }
    }

    AI(proj) {
        const i = proj.whoAmI;
        const player = Main.player[proj.owner];
        const duration = new ProjAI(proj)[1] | 0;
        const despawning = proj.timeLeft <= DESPAWN_TICKS;

        if (_restore[i]) {
            this.RestoreFlightState(player, i);
            _restore[i] = 0;
        }

        if (!despawning && proj.alpha > 0) proj.alpha = Math.max(0, proj.alpha - FADE_IN_STEP);

        const attached = _attachTimer[i] > 0;

        if (!attached && (!player.active || player.dead)) {
            this.StartDespawn(proj);
            this.Animate(proj, duration, false);
            return;
        }

        if (despawning) {
            this.DespawnAI(proj, player);
            this.Animate(proj, duration, false);
            return;
        }

        if (attached) {
            proj.Center = player.Center;
            proj.position = Vector2.new(
                proj.position.X - player.direction * ATTACHED_X_OFFSET,
                proj.position.Y - HOVER_Y
            );
            proj.direction = -player.direction;
            proj.spriteDirection = -proj.direction;
            proj.velocity = Vector2.Zero;

            _attachTimer[i]++;
            if (_attachTimer[i] > duration) this.StartDespawn(proj);
            this.Animate(proj, duration, false);
            return;
        }

        if (!_arrived[i]) {
            this.FlyToPerch(proj, i);
            this.Animate(proj, duration, false);
            return;
        }

        this.TryAttach(proj, i, player, duration);
        this.Animate(proj, duration, _attachTimer[i] === 0);
    }

    FlyToPerch(proj, i) {
        const center = proj.Center;
        const dx = _targetX[i] - center.X;
        const dy = _targetY[i] - HOVER_Y - center.Y;
        const distanceSq = dx * dx + dy * dy;

        if (distanceSq <= ARRIVE_SQ) {
            _arrived[i] = 1;
            proj.Center = Vector2.new(_targetX[i], _targetY[i] - HOVER_Y);
            proj.velocity = Vector2.Zero;
            return;
        }

        const distance = Math.sqrt(distanceSq);
        proj.velocity = Vector2.new(dx / distance * FLY_SPEED, dy / distance * FLY_SPEED);
        proj.direction = proj.velocity.X > 0 ? -1 : 1;
        proj.spriteDirection = -proj.direction;
    }

    TryAttach(proj, i, player, duration) {
        const targetX = _targetX[i];
        const targetY = _targetY[i];

        if (player.DistanceSQ(Vector2.new(targetX, targetY)) >= PLAYER_ARRIVE_SQ) return;

        const facingRight = proj.direction === 1;
        const passed = facingRight ? player.Left.X < targetX : player.Right.X > targetX;
        if (!passed) return;

        player.AddBuff(Terraria.ID.BuffID.Featherfall, duration, true);

        _wingTime[i] = player.wingTime;
        _jumpMask[i] = this.CaptureJumpFlags(player);
        _restore[i] = 1;

        try { player['void RemoveAllGrapplingHooks()'](); } catch (_) { }

        _attachTimer[i] = 1;
        proj.velocity = Vector2.Zero;
    }

    CaptureJumpFlags(player) {
        let mask = 0;
        for (let f = 0; f < JUMP_FLAGS.length; f++) {
            if (player[JUMP_FLAGS[f]]) mask |= 1 << f;
        }
        return mask;
    }

    RestoreFlightState(player, i) {
        if (player.wingTime > _wingTime[i]) player.wingTime = _wingTime[i];
        const mask = _jumpMask[i];
        for (let f = 0; f < JUMP_FLAGS.length; f++) {
            if (!(mask & (1 << f))) player[JUMP_FLAGS[f]] = false;
        }
    }

    StartDespawn(proj) {
        if (proj.timeLeft > DESPAWN_TICKS) proj.timeLeft = DESPAWN_TICKS;
    }

    DespawnAI(proj, player) {
        proj.alpha = Math.min(255, proj.alpha + FADE_OUT_STEP);

        let velocityX = proj.velocity.X;
        let velocityY = proj.velocity.Y;

        if (velocityY === 0 && player.velocity.Y < 0) velocityY = player.velocity.Y * CARRY_FACTOR;
        if (velocityY > RISE_CAP) velocityY -= RISE_ACCEL;
        else velocityY *= RISE_DRAG;

        if (velocityX === 0) {
            velocityX = Math.sign(player.velocity.X) * Math.max(MIN_DRIFT, Math.abs(player.velocity.X / 2));
        }

        proj.velocity = Vector2.new(velocityX, velocityY);
    }

    Animate(proj, duration, slowFlight) {
        const i = proj.whoAmI;
        const settled = proj.timeLeft <= DESPAWN_TICKS
            || (_attachTimer[i] > 0 && _attachTimer[i] > duration / 2);

        proj.frameCounter++;

        if (settled) {
            if (proj.frame < 2) proj.frame = 2;
            if (proj.frameCounter <= 5) return;
            proj.frameCounter = 0;
            proj.frame = proj.frame + 1 >= FRAMES ? 2 : proj.frame + 1;
            return;
        }

        const rate = slowFlight ? 4 : 2;
        if (proj.frameCounter <= rate) return;
        proj.frameCounter = 0;
        proj.frame = proj.frame + 1 >= 2 ? 0 : proj.frame + 1;
    }

    GetAlpha(proj, lightColor) {
        return Color.Multiply(Color.Lerp(lightColor, Color.White, LIGHT_LERP), proj.Opacity);
    }
}
