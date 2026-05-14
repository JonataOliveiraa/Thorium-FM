import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rectangle } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class JungleArrow extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 1;
    }

    SetDefaults() {
        this.Projectile.width = 9;
        this.Projectile.height = 18;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.hostile = false;
        this.Projectile.alpha = 0;
        this.Projectile.aiStyle = 1
        this.Projectile.timeLeft = 240;
    }

    AI(proj) {
        proj.rotation = Vector2.ToRotation(proj.velocity) + Math.PI / 2;

        if (Math.random() < 0.3) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position,
                proj.width,
                proj.height,
                2,
                proj.velocity.X * 0.1, proj.velocity.Y * 0.1,
                100,
                Color.ForestGreen,
                0.8
            );
            if (dust) {
                dust.noGravity = true;
                dust.noLight = true;
            }
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 8; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position,
                proj.width,
                proj.height,
                2,
                (Math.random() - 0.5) * 4,
                (Math.random() - 0.5) * 4,
                100,
                Color.ForestGreen,
                1.0
            );
            if (dust) {
                dust.noLight = true;
                dust.noGravity = false;
            }
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(20, 360, false);
    }
}
