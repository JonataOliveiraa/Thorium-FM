import { Terraria, Modules, System } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Main } = Terraria
const { Color, Vector2, Effects } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class ShadowWandPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/ShadowWandPro';  // textura vazia no original (ThoriumMod/Empty)
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 180;
        this.Projectile.extraUpdates = 2;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 180;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        Effects.AddLight(proj.Center, 0.4, 0.25, 0.65);

        ai[1]++;
        if (ai[1] > 1) {
            const vel = proj.velocity;
            vel.X += Rand.NextFloat(-0.4, 0.4);
            vel.Y += Rand.NextFloat(-0.4, 0.4);
            proj.velocity = vel;
            ai[1] = 0;
        }

        for (let i = 0; i < 4; i++) {
            const offsetX = proj.velocity.X * i * 0.25;
            const offsetY = proj.velocity.Y * i * 0.25;
            const dustPos = Vector2.new(
                proj.Center.X - offsetX,
                proj.Center.Y - offsetY
            );

            const dustIndex = NewDust(dustPos, 1, 1, 27, 0, 0, 100, Color.Transparent, 1.25);
            if (dustIndex >= 0 && dustIndex < Main.dust.length) {
                const dust = Main.dust[dustIndex];
                dust.noGravity = true;
                dust.position = dustPos;
                dust.velocity = Vector2.new(0, 0);
            }
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(153, 30, false);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 4; i++) {
            const dustIndex = NewDust(
                proj.position, proj.width, proj.height,
                27,
                Rand.NextFloat(-3, 3),
                Rand.NextFloat(-3, 3),
                0, Color.Transparent, 1.0
            );
            if (dustIndex >= 0 && dustIndex < Main.dust.length) {
                Main.dust[dustIndex].noGravity = true;
            }
        }
    }

    PreDraw() {
        return false
    }
}