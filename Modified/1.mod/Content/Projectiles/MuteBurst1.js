import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class MuteBurst1 extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.extraUpdates = 10;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 6;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        for (let i = 0; i < 4; i++) {
            const offsetX = proj.velocity.X * i * 0.25;
            const offsetY = proj.velocity.Y * i * 0.25;
            const dustPos = Vector2.new(proj.position.X - offsetX, proj.position.Y - offsetY);

            const dustIndex = Effects.NewDust(
                dustPos, 1, 1,
                87, 0, 0, 0,
                Color.White, 1.0
            );
            const dust = Main.dust[dustIndex];
            if (dust) {
                dust.noGravity = true;
                dust.position = dustPos;
                let dv = dust.velocity;
                dv.X *= 0.2;
                dv.Y *= 0.2;
                dust.velocity = dv;
            }
        }
    }
}