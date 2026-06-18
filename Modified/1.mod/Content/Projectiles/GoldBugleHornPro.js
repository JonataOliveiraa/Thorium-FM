import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class GoldBugleHornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.scale = 1;
        this.Projectile.friendly = true;
        this.Projectile.timeLeft = 130;
        this.Projectile.alpha = 255;
        this.Projectile.extraUpdates = 1;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj, false);

        if (localAI[0] < 48) localAI[0]++;

        const timer = ai[0];
        const amplitude = (ai[1] > 0) ? 14 : -14;
        const waveStep = 0.157079637;

        const firstTick = (timer === 0);

        const speed = Math.sqrt(proj.velocity.X * proj.velocity.X + proj.velocity.Y * proj.velocity.Y);
        let rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);

        if (!firstTick) {
            const prevOffset = Math.sin((timer - 1) * waveStep) * amplitude;
            const currentOffset = Math.sin(timer * waveStep) * amplitude;
            const delta = currentOffset - prevOffset;

            const newSpeed = Math.sqrt(speed * speed - delta * delta);
            if (newSpeed > 0) {
                rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) - Math.atan2(delta, newSpeed);
            }
        }

        const nextOffset = Math.sin((timer + 1) * waveStep) * amplitude;
        const currentOffset = Math.sin(timer * waveStep) * amplitude;
        const lateral = nextOffset - currentOffset;

        const velX = Math.cos(rotation) * speed + Math.cos(rotation + Math.PI/2) * lateral;
        const velY = Math.sin(rotation) * speed + Math.sin(rotation + Math.PI/2) * lateral;

        let vel = proj.velocity;
        vel.X = velX;
        vel.Y = velY;
        proj.velocity = vel;

        proj.rotation = Math.atan2(vel.Y, vel.X) + 1.57079637; // ajuste visual

        ai[0]++; // incrementa timer

        const num = 0.2 + localAI[0] / 48.0;
        const dustIndex = Effects.NewDust(
            proj.Center, 0, 0,
            87,            
            0, 0,
            0,
            Color.White,
            0.5 + num
        );
        const dust = Main.dust[dustIndex];
        if (dust) {
            dust.noGravity = true;
            dust.velocity = Vector2.Zero;
        }

        Effects.AddLight(proj.Center, 0.5, 0.4, 0.1);
    }

    OnKill(proj) {
        for (let i = 0; i < 5; i++) {
            const dustIndex = Effects.NewDust(
                proj.Center, 0, 0,
                87,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                0, Color.White, 0.75
            );
            const dust = Main.dust[dustIndex];
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw() {
        return false;
    }
}