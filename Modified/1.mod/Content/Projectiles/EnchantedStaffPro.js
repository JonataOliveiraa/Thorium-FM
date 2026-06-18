import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js'; // Usando o seu helper
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;

export class EnchantedStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 3;
        this.Projectile.timeLeft = 600;
        this.Projectile.alpha = 255;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj);

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

        const amplitude = ai[0] > 0 ? 5.0 : -5.0;
        const frequency = 0.10;

        const waveOffset = Math.cos(ai[1] * frequency) * amplitude * frequency;

        let vel = proj.velocity;
        vel.X = baseX + perpX * waveOffset;
        vel.Y = baseY + perpY * waveOffset;
        proj.velocity = vel;

        ai[1]++;

        let dustType;
        const r = Math.random();
        if (r < 0.33) dustType = 15;
        else if (r < 0.66) dustType = 57;
        else dustType = 58;

        const dustIndex = Effects.NewDust(
            proj.Center, 0, 0,
            dustType,
            0, 0,
            0,
            Color.White,
            1.35
        );

        if (dustIndex >= 0 && dustIndex < 2000) {
            const dust = Terraria.Main.dust[dustIndex];
            dust.noGravity = true;
            dust.fadeIn = 1.5;
            let dv = dust.velocity;
            dv.X = 0;
            dv.Y = 0;
            dust.velocity = dv;
        }

        Effects.AddLight(proj.Center, 0.1, 0.2, 0.4);
    }

    OnKill(proj, timeLeft) {
        for (let i = 4; i < 19; i++) {
            const multiplier = 20.0 / i;
            const vecX = proj.oldVelocity.X * multiplier;
            const vecY = proj.oldVelocity.Y * multiplier;

            let dustType;
            const r = Math.random();
            if (r < 0.33) dustType = 15;
            else if (r < 0.66) dustType = 57;
            else dustType = 58;

            const posX = proj.position.X - vecX;
            const posY = proj.position.Y - vecY;

            const dustIndex = Effects.NewDust(
                Vector2.new(posX, posY), 8, 8,
                dustType,
                proj.oldVelocity.X * 0.2, proj.oldVelocity.Y * 0.2,
                100,
                Color.White,
                1.8
            );

            if (dustIndex >= 0 && dustIndex < 2000) {
                const dust = Terraria.Main.dust[dustIndex];
                dust.velocity.X *= 1.5;
                dust.velocity.Y *= 1.5;
                dust.noGravity = true;
            }
        }
    }

    PreDraw() {
        return false
    }
}