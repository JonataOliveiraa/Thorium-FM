import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GreenHagPro3 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.scale = 1;
        this.Projectile.tileCollide = false;
        this.Projectile.hostile = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
    }

    AI(proj) {
        const alpha = proj.alpha;

        if (alpha < 170 && alpha + 5 >= 170 && Main.netMode !== 2) {
            const vel = proj.velocity;
            for (let i = 0; i < 3; i++) {
                NewDust(proj.position, proj.width, proj.height, 2, vel.X * 0.025, vel.Y * 0.025, 170, Color.White, 1.2);
            }
            NewDust(proj.position, proj.width, proj.height, 55, 0, 0, 170, Color.White, 1.1);
        }

        if (alpha < 255) proj.alpha = Math.min(255, alpha + 5);
    }

    OnHitPlayer(proj, player) {
        if (Math.random() >= 0.3333) return;
        player.AddBuff(20, 600, false);
    }
}
