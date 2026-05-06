import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Main } = Terraria;
const { Color, Vector2, Rand } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class CrietzPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = 1;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 180;
        this.Projectile.alpha = 255;
        this.Projectile.extraUpdates = 3;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.scale = 1;
    }

    AI(proj) {
        if (proj.timeLeft < 150)
            proj.friendly = true;

        let vel = proj.velocity
        vel.Y /= 1.00078
        proj.velocity = vel;

        for (let i = 0; i < 3; i++) {
            const offsetX = proj.velocity.X / 3 * i;
            const offsetY = proj.velocity.Y / 3 * i;
            const dustIndex = NewDust(
                proj.position, proj.width, proj.height,
                15,
                0, 0,
                100, Color.White, 1.25
            );
            if (dustIndex >= 0 && dustIndex < Main.dust.length) {
                const dust = Main.dust[dustIndex];
                dust.position.X = proj.Center.X - offsetX;
                dust.position.Y = proj.Center.Y - offsetY;
                dust.velocity = Vector2.new(0, 0);
                dust.noGravity = true;
            }
        }

        for (let j = 0; j < 2; j++) {
            const dustIndex = NewDust(
                proj.position, proj.width / 2, proj.height / 2,
                15,
                Rand.Next(-1, 2),
                Rand.Next(-1, 2),
                100, Color.White, 0.75
            );
            if (dustIndex >= 0 && dustIndex < Main.dust.length) {
                Main.dust[dustIndex].noGravity = true;
            }
        }
    }

    OnHitNPC(proj, npc) {
        const target = npc;
        for (let i = 0; i < 15; i++) {
            const offsetX = Rand.Next(-50, 51);
            const offsetY = Rand.Next(-50, 51);
            const dustIndex = NewDust(
                target.position, target.width, target.height,
                15,
                0, 0, 100, Color.White, 0.85
            );
            if (dustIndex >= 0 && dustIndex < Main.dust.length) {
                const dust = Main.dust[dustIndex];
                dust.noGravity = true;
                dust.velocity = Vector2.new(
                    dust.velocity.X * 0.75,
                    dust.velocity.Y * 0.75
                );
                dust.position.X += offsetX;
                dust.position.Y += offsetY;
                dust.velocity.X += -offsetX * 0.075;
                dust.velocity.Y += -offsetY * 0.075;
            }
        }
    }

    PreDraw() {
        return false
    }
}