import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { SoundHelper } from '../../../Global/Utils/SoundHelper.js';
import { ProjAI } from '../../../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const IMPACT_DUST = 18; // particulas por camada do impacto
const WAVE_WIDTH = 200;
const WAVE_HEIGHT = 100;

export class ViscountStomp extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 20;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.alpha = 255;
    }

    PreDraw(proj, lightColor) {
        return false;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);

        if (local[0] !== 1) {
            local[0] = 1;
            SoundHelper.play(['Item69', 'Item14'], proj.Center.X, proj.Center.Y);
        }

        // Impacto
        if (proj.timeLeft === 18) {
            SoundHelper.play(['Item14'], proj.Center.X, proj.Center.Y);

            const bottom = proj.Bottom;
            for (let i = 0; i < IMPACT_DUST; i++) {
                const offset = Vector2.Multiply(
                    Vector2.RotatedBy(Vector2.new(7, 0), i * Math.PI * 2 / IMPACT_DUST),
                    Vector2.new(1, 0.7)
                );
                const d = Effects.NewDust(proj.position, proj.width, proj.height, 1, 0, 0, 100, Color.White, 1.5);
                const dust = Main.dust[d];
                if (!dust) continue;
                dust.alpha = 0;
                dust.position = Vector2.Add(bottom, offset);
                dust.velocity = Vector2.new(dust.velocity.X * 6, dust.velocity.Y - 10);
                dust.noGravity = true;
            }

            for (let i = 0; i < IMPACT_DUST; i++) {
                const offset = Vector2.Multiply(
                    Vector2.RotatedBy(Vector2.new(7, 0), i * Math.PI * 2 / IMPACT_DUST),
                    Vector2.new(1, 0.7)
                );
                const d = Effects.NewDust(proj.position, proj.width, proj.height, 1, 0, 0, 100, Color.White, 1.35);
                const dust = Main.dust[d];
                if (!dust) continue;
                dust.alpha = 100;
                dust.position = Vector2.Add(bottom, offset);
                dust.velocity = Vector2.new(dust.velocity.X * 8, dust.velocity.Y - 5);
                dust.noGravity = true;
            }
        }

        if (proj.timeLeft >= 18) return;

        // Vira uma area de dano larga e parada
        proj.velocity = Vector2.Zero;
        proj.tileCollide = false;

        const centerX = proj.position.X + proj.width / 2;
        const centerY = proj.position.Y + proj.height / 2;
        proj.width = WAVE_WIDTH;
        proj.height = WAVE_HEIGHT;
        proj.position = Vector2.new(centerX - WAVE_WIDTH / 2, centerY - WAVE_HEIGHT / 2);
    }
}
