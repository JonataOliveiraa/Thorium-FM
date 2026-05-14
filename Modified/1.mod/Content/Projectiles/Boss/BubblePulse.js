import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class BubblePulse extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1.0;
        this.Projectile.alpha = 125;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
    }

    AI(proj) {
        const ai = new ProjAI(proj);

        // Play sound on first tick
        if (ai[0] === 0) {
            ai[0] = 1;
            Effects.PlaySound(Terraria.ID.SoundID.Item56, proj.Center.X, proj.Center.Y);
        }

        if (Math.random() < 0.333) {
            const vel = proj.velocity;
            const dustIdx = NewDust(
                proj.position, proj.width, proj.height,
                29,
                vel.X * 0.2, vel.Y * 0.2,
                100, Color.Transparent, 0.75
            );
            if (dustIdx >= 0) {
                Terraria.Main.dust[dustIdx].noGravity = true;
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        Effects.PlaySound(Terraria.ID.SoundID.Item56, proj.position.X, proj.position.Y);

        const num = 15;
        for (let i = 0; i < num; i++) {
            const angle = (i / num) * Math.PI * 2;
            const rotated = Vector2.new(Math.cos(angle) * 3, Math.sin(angle) * 3);
            const dustIdx = NewDust(
                proj.Center, 0, 0,
                176,
                0, 0,
                0, Color.Transparent, 1.2
            );
            if (dustIdx >= 0) {
                const dust = Terraria.Main.dust[dustIdx];
                dust.noGravity = true;
                dust.position = Vector2.Add(proj.Center, rotated);
                dust.velocity = Vector2.Multiply(rotated, 1 / 3);
            }
        }
        return true;
    }
}
