import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class AquaPelterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 1;
        this.Projectile.alpha = 50;
        this.Projectile.scale = 1;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;
        this.AIType = 14;
    }

    AI(proj) {
        for (let i = 0; i < 2; i++) {
            const offsetX = proj.velocity.X / 3 * i;
            const offsetY = proj.velocity.Y / 3 * i;

            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                33,
                0, 0,
                0, Color.White, 1.2 
            );
            const dust = Main.dust[dustIdx];
            if (dust) {
                dust.position = Vector2.new(proj.Center.X - offsetX, proj.Center.Y - offsetY);
                dust.velocity = Vector2.Zero;
                dust.noGravity = true;
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        Effects.PlaySound(Terraria.ID.SoundID.Item10, proj.position.X, proj.position.Y);
        Terraria.Dust.NewDust(
            proj.position, proj.width, proj.height,
            33, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1
        );
        return true;
    }
}