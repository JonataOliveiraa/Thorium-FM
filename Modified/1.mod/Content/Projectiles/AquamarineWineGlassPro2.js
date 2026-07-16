import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDustPerfect = Terraria.Dust.NewDustPerfect;
const NewDustDirect = Terraria.Dust.NewDustDirect;

export class AquamarineWineGlassPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
        this.Projectile.tileCollide = true;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        const num = 3;
        for (let i = 0; i < num; i++) {
            const dust = NewDustPerfect(
                Vector2.new(
                    proj.Center.X - (proj.velocity.X / num) * i,
                    proj.Center.Y - (proj.velocity.Y / num) * i
                ),
                132,
                Vector2.Zero,
                75,
                Color.White,
                0.5
            );
            if (dust) {
                dust.noGravity = true;
                dust.velocity = Vector2.Zero;
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        NewDustDirect(
            proj.position, proj.width, proj.height,
            132,
            proj.velocity.X * 0.2,
            proj.velocity.Y * 0.2,
            100, Color.White, 1
        );
        return true;
    }

    PreDraw() {
        return false;
    }
}