import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];

export class BubbleConchPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 28;
        this.Projectile.height = 28;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 255;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        // Fade in rápido (255 → 0 em ~13 ticks)
        if (proj.alpha > 0) {
            proj.alpha -= 20;
            if (proj.alpha < 0) proj.alpha = 0;
        }

        const ai = new ProjAI(proj);

        // Desacelera horizontalmente
        let vel = proj.velocity;
        vel.X /= 1.006;

        // Sobe em pulsos
        ai[1]++;
        if (ai[1] >= 0) {
            vel.Y -= 1.02;
            ai[1] = -15;
        }

        proj.velocity = vel;

        // Rotação suave
        proj.rotation += proj.velocity.X * 0.02;
    }

    OnKill(proj, timeLeft) {
        PlaySound(54, proj.position, 0, 0);

        const count = 40;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const radius = 20;

            const offsetX = Math.cos(angle) * radius;
            const offsetY = Math.sin(angle) * radius;

            const dustIndex = NewDust(
                proj.Center, 0, 0,
                176,
                0, 0,
                50, Color.Transparent, 1.25
            );

            if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.noGravity = true;
                dust.position = Vector2.new(proj.Center.X + offsetX, proj.Center.Y + offsetY);
                dust.velocity = Vector2.new(offsetX / radius, offsetY / radius);
            }
        }
    }
}