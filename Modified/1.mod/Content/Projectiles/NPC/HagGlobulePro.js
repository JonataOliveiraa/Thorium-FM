import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class HagGlobulePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.light = 0.2;
        this.Projectile.penetrate = 1;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.timeLeft = 300;
    }

    AI(proj) {
        const vel = proj.velocity;
        vel.Y /= 1.0065;

        const ai = new ProjAI(proj, false);
        ai[1]++;
        if (ai[1] >= 0) {
            vel.Y += 1.02;
            ai[1] = -15;
        }
        proj.velocity = vel;

        if (Main.netMode === 2) return;

        const origin = Vector2.new(proj.position.X - vel.X, proj.position.Y - vel.Y);

        for (let i = 0; i < 3; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, 176, 0, 0, 100, Color.White, 1.2)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }
        for (let i = 0; i < 2; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, 172, 0, 0, 100, Color.White, 0.8)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }
    }

    OnKill(proj, timeLeft) {
        if (Main.netMode === 2) return;

        const origin = Vector2.new(proj.position.X, proj.position.Y + 2);
        for (let i = 0; i < 10; i++) {
            const dust = Main.dust[NewDust(origin, proj.width + 5, proj.height + 5, 29, proj.velocity.X * 0.2, proj.velocity.Y * 0.2, 100, Color.White, 1.5)];
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
