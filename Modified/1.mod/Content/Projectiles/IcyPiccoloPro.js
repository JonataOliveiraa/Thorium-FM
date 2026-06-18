import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color } = Modules;
const { Main } = Terraria;

export class IcyPiccoloPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = "Projectiles/" + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 11;
        this.Projectile.height = 11;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.ignoreWater = false;
        this.Projectile.tileCollide = true;
        this.Projectile.timeLeft = 120;
        this.Projectile.alpha = 255;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj, false);

        if (localAI[0] === 0 && localAI[1] === 0) {
            localAI[0] = proj.velocity.X;
            localAI[1] = proj.velocity.Y;
            if (ai[0] === 0) ai[0] = 1;
        }

        const baseX = localAI[0];
        const baseY = localAI[1];

        let len = Math.sqrt(baseX * baseX + baseY * baseY);
        let dirX = len > 0 ? baseX / len : 0;
        let dirY = len > 0 ? baseY / len : 0;

        let perpX = -dirY;
        let perpY = dirX;

        const amplitude = 6.0;
        const frequency = 0.20944;

        const waveOffset = Math.sin(ai[1] * frequency) * amplitude * frequency;

        let vel = proj.velocity;
        vel.X = baseX + perpX * waveOffset;
        vel.Y = baseY + perpY * waveOffset;
        proj.velocity = vel;

        ai[1]++;

        // Criação do dust alinhado, forçando velocidade zero
        const index = Effects.NewDust(
            proj.Center,   // posição
            0, 0,          // width, height (0 = ponto exato)
            88,            // tipo de dust (gelo)
            0, 0,          // speedX, speedY = 0
            0,             // alpha
            Color.White,   // cor
            1.5
        );

        const dust = Main.dust[index];

        if (dust) {
            Main.dust[index].noGravity = true;
            Main.dust[index].fadeIn = 1.0;
            Main.dust[index].velocity = Vector2.Zero;
        }

        proj.rotation = Math.atan2(vel.Y, vel.X);
    }

    OnHitNPC(proj, npc, hit, damageDone) {
        npc.AddBuff(44, 60, false);
    }

    OnKill(proj) {
        for (let i = 0; i < 5; i++) {
            const dustIndex = Effects.NewDust(
                proj.Center, 0, 0,
                88,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                0, Color.White, 0.75
            );
            const dust = Main.dust[dustIndex];
            if (dust) dust.noGravity = true;
        }
    }
}