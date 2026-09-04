import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { WindHoming } from './../../Common/WindHoming.js';

const { Effects, Rand, Vector2 } = Modules;

const NewDustPerfect = Terraria.Dust.NewDustPerfect;

const TRAIL_DUST = 157;
const TRAIL_DRIFT = 2;
const TRAIL_FADE_IN = 1.4;
const TRAIL_SCALE = 1.15;
const DEATH_DUST_COUNT = 5;
const DEATH_DUST_SPREAD = 3;

const WAVE_AMPLITUDE = 6;
const WAVE_STEP = 0.209439516;

const LIGHT_R = 0.15;
const LIGHT_G = 0.6;
const LIGHT_B = 0.2;

export class ForestOcarinaPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.friendly = true;
        this.Projectile.timeLeft = 120;
    }

    _wave(proj, timer) {
        const velocity = proj.velocity;
        const phase = timer * WAVE_STEP;
        const offset = Math.sin(phase) * WAVE_AMPLITUDE;

        let speed;
        let heading;

        if (timer === 0) {
            speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
            heading = Math.atan2(velocity.Y, velocity.X);
        } else {
            const drift = offset - Math.sin(phase - WAVE_STEP) * WAVE_AMPLITUDE;
            const lengthSquared = velocity.X * velocity.X + velocity.Y * velocity.Y;
            speed = Math.sqrt(Math.max(0, lengthSquared - drift * drift));
            heading = Math.atan2(velocity.Y, velocity.X) - Math.atan2(drift, speed);
        }

        if (WindHoming.Active()) {
            proj.velocity = Vector2.new(Math.cos(heading) * speed, Math.sin(heading) * speed);
            if (WindHoming.Apply(proj)) {
                const homed = proj.velocity;
                speed = Math.sqrt(homed.X * homed.X + homed.Y * homed.Y);
                heading = Math.atan2(homed.Y, homed.X);
            }
        }

        const step = Math.sin(phase + WAVE_STEP) * WAVE_AMPLITUDE - offset;
        const cos = Math.cos(heading);
        const sin = Math.sin(heading);

        const nextX = speed * cos - step * sin;
        const nextY = speed * sin + step * cos;

        proj.velocity = Vector2.new(nextX, nextY);
        proj.rotation = Math.atan2(nextY, nextX) + Math.PI * 0.5;
    }

    _trailDust(position, drift) {
        const dust = NewDustPerfect(position, TRAIL_DUST, drift, 0, null, 1);
        if (!dust) return;

        dust.noGravity = true;
        dust.fadeIn = TRAIL_FADE_IN;
        dust.scale = TRAIL_SCALE;
    }

    _createTrail(proj) {
        const velocity = proj.velocity;
        const speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        if (speed <= 0) return;

        const drift = Vector2.new(velocity.X / speed * TRAIL_DRIFT, velocity.Y / speed * TRAIL_DRIFT);
        const center = proj.Center;

        this._trailDust(center, drift);
        this._trailDust(Vector2.new(center.X - velocity.X * 0.5, center.Y - velocity.Y * 0.5), drift);
    }

    OnSpawn(proj) {
        WindHoming.Reset(proj);
    }

    AI(proj) {
        const ai = new ProjAI(proj);

        this._wave(proj, ai[0]);
        ai[0]++;

        this._createTrail(proj);
        Effects.AddLight(proj.Center, LIGHT_R, LIGHT_G, LIGHT_B);
    }

    OnKill(proj) {
        const position = proj.position;
        const width = proj.width;
        const height = proj.height;

        for (let index = 0; index < DEATH_DUST_COUNT; index++) {
            const dustIndex = Effects.NewDust(
                position, width, height, TRAIL_DUST,
                Rand.NextFloat(-DEATH_DUST_SPREAD, DEATH_DUST_SPREAD),
                Rand.NextFloat(-DEATH_DUST_SPREAD, DEATH_DUST_SPREAD),
                0, null, 1
            );
            const dust = Terraria.Main.dust[dustIndex];
            if (dust) dust.noGravity = true;
        }
    }
}
