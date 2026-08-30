import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class CyanHagPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 6;
    }

    SetDefaults() {
        this.Projectile.width = 40;
        this.Projectile.height = 42;
        this.Projectile.aiStyle = 0;
        this.Projectile.scale = 1;
        this.Projectile.alpha = 255;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 210;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        ai[0]++;

        const armed = ai[0] >= 150;

        if (armed) {
            proj.alpha = 0;
            proj.hostile = true;
        } else if (proj.alpha > 90) {
            proj.alpha = Math.max(90, proj.alpha - 7);
        }

        if (ai[0] === 150 && Main.netMode !== 2) {
            for (let i = 0; i < 14; i++) {
                const dust = Main.dust[NewDust(proj.position, proj.width, proj.height, 176, Math.random() * 10 - 5, Math.random() * 10 - 5, 0, Color.White, 1.3)];
                if (dust) dust.noGravity = true;
            }
        }

        proj.frameCounter++;
        if (proj.frameCounter > (armed ? 3 : 7)) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= 6) proj.frame = 0;
        }
    }

    OnHitPlayer(proj, player) {
        const vel = player.velocity;
        vel.Y -= 15;
        player.velocity = vel;
    }

    OnKill(proj, timeLeft) {
        if (Main.netMode === 2) return;

        for (let i = 0; i < 10; i++) {
            const dust = Main.dust[NewDust(proj.position, proj.width, proj.height, 176, Math.random() * 8 - 4, Math.random() * 8 - 4, 0, Color.White, 1)];
            if (dust) dust.noGravity = true;
        }
    }
}
