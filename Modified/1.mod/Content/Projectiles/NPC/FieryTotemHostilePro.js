import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class FieryTotemHostilePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/FieryTotemPro';
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = 8;
        this.Projectile.friendly = false;
        this.Projectile.hostile = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
    }

    AI(proj) {
        const vel = proj.velocity;
        proj.rotation += (vel.X > 0 ? 1 : -1) * 0.06;

        if (Main.netMode === 2) return;

        const origin = Vector2.new(proj.position.X - vel.X, proj.position.Y - vel.Y);

        for (let i = 0; i < 3; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, 6, 0, 0, 100, Color.White, 1.4)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }
        for (let i = 0; i < 2; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, 127, 0, 0, 100, Color.White, 0.8)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }
    }

    OnTileCollide(proj, hitDirection) {
        if (Main.netMode !== 2) {
            for (let i = 0; i < 8; i++) {
                const dust = Main.dust[NewDust(proj.position, proj.width, proj.height, 6, Math.random() * 8 - 4, Math.random() * 8 - 4, 0, Color.White, 1.2)];
                if (dust) dust.noGravity = true;
            }
        }

        const local = new ProjAI(proj, true);
        if (local[0] >= 4) return true;

        local[0]++;
        return false;
    }

    OnHitPlayer(proj, player) {
        player.AddBuff(24, 90, false);
    }
}
