import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const DUST = 86;
const BURST_COUNT = 20;
const BURST_RADIUS = 4;
const TRAIL_COUNT = 2;
const HOMING_RANGE = 750;
const HOMING_SPEED = 9;
const HOMING_WEIGHT = 0.08;

export class DarkHeartPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = 1;
        this.Projectile.friendly = true;
        this.Projectile.timeLeft = 180;
    }

    _burst(proj) {
        const center = proj.Center;

        for (let index = 0; index < BURST_COUNT; index++) {
            const angle = index * Math.PI * 2 / BURST_COUNT;
            const dustIndex = Effects.NewDust(center, 0, 0, DUST, 0, 0, 0, Color.White, 1.25);
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.noGravity = true;
            dust.position = Vector2.new(center.X + Math.cos(angle) * BURST_RADIUS, center.Y + Math.sin(angle) * BURST_RADIUS);
            dust.velocity = Vector2.new(Math.cos(angle), Math.sin(angle));
        }
    }

    _trail(proj) {
        const center = proj.Center;
        const velocity = proj.velocity;

        for (let index = 0; index < TRAIL_COUNT; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, DUST, 0, 0, 0, Color.White, 1.25);
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.position = Vector2.new(center.X - velocity.X / 3 * index, center.Y - velocity.Y / 3 * index);
            dust.velocity = Vector2.Zero;
            dust.noGravity = true;
            dust.scale = 1.6;
        }
    }

    AI(proj) {
        if (proj.timeLeft === 180) this._burst(proj);
        this._trail(proj);

        const target = FindTargetWithinRange(proj, HOMING_RANGE, true);
        if (!target) return;

        const center = proj.Center;
        const dx = target.Center.X - center.X;
        const dy = target.Center.Y - center.Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= 0) return;

        const velocity = proj.velocity;
        proj.velocity = Vector2.new(
            velocity.X * (1 - HOMING_WEIGHT) + dx / distance * HOMING_SPEED * HOMING_WEIGHT,
            velocity.Y * (1 - HOMING_WEIGHT) + dy / distance * HOMING_SPEED * HOMING_WEIGHT
        );
    }
}
