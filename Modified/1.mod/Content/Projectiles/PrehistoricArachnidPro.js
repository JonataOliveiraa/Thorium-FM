import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const FRAMES = 4;
const FRAME_RATE = 5;

const HOMING_RANGE = 600;
const SPEED = 9;
const TURN_WEIGHT = 0.09;

const FADE_OUT_TIME = 30;
const FADE_OUT_SPEED = 5;

export class PrehistoricArachnidPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.MinionShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.summon = true;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 180;
        this.Projectile.penetrate = -1;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }

    _animate(proj) {
        proj.frameCounter++;
        if (proj.frameCounter <= FRAME_RATE) return;

        proj.frameCounter = 0;
        proj.frame = (proj.frame + 1) % FRAMES;
    }

    AI(proj) {
        this._animate(proj);

        if (proj.timeLeft <= FADE_OUT_TIME) {
            proj.alpha = Math.min(255, proj.alpha + FADE_OUT_SPEED);
        }

        const velocity = proj.velocity;
        const target = FindTargetWithinRange(proj, HOMING_RANGE, false);

        if (target) {
            const center = proj.Center;
            const dx = target.Center.X - center.X;
            const dy = target.Center.Y - center.Y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance > 0) {
                proj.velocity = Vector2.new(
                    velocity.X * (1 - TURN_WEIGHT) + dx / distance * SPEED * TURN_WEIGHT,
                    velocity.Y * (1 - TURN_WEIGHT) + dy / distance * SPEED * TURN_WEIGHT
                );
            }
        }

        const current = proj.velocity;
        proj.rotation = Math.atan2(current.Y, current.X);
        proj.spriteDirection = current.X < 0 ? -1 : 1;
    }
}
