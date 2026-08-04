import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const LIFE = 60;
const BURST_AT = 54;    // com extraUpdates 15 isso e quase o tick do disparo
const BURST_COUNT = 15;
const SPARK_DUST = 15;  // faisca clara
const TRAIL_STEPS = 4;

export class TheZapperPro extends ModProjectile {
    constructor() {
        super();
        // O projetil em si e invisivel: quem aparece e o rastro de faiscas
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = -1;
        this.Projectile.ranged = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.extraUpdates = 15;
    }

    AI(proj) {
        if (proj.timeLeft === BURST_AT) {
            const center = proj.Center;
            const rotation = Math.atan2(proj.velocity.Y, proj.velocity.X);
            FxHelper.ring(center.X, center.Y, BURST_COUNT, 1, 3, SPARK_DUST, 1, 1.5, rotation, 225);
        }

        if (proj.timeLeft > BURST_AT) return;

        // Costura o rastro entre a posicao deste tick e a do anterior, senao
        // com extraUpdates 15 o raio sairia picotado
        const center = proj.Center;
        const vel = proj.velocity;

        for (let i = 0; i < TRAIL_STEPS; i++) {
            const px = center.X - vel.X * i * 0.25;
            const py = center.Y - vel.Y * i * 0.25;

            const dust = Main.dust[Effects.NewDust(Vector2.new(px, py), 1, 1, SPARK_DUST, 0, 0, 225, WHITE, 1)];
            if (!dust) continue;

            dust.noGravity = true;
            dust.position = Vector2.new(px, py);
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
        }
    }

    // Ele nao e desenhado: o efeito inteiro sao as faiscas
    PreDraw(proj, lightColor) {
        return false;
    }

    OnTileCollide(proj, hitDirection) {
        SoundHelper.play(['Item10', 'Item27'], proj.position.X, proj.position.Y);
        FxHelper.burst(proj.position, proj.width, proj.height, 10, SPARK_DUST, 1, 1.25, 225);
        return true;
    }
}
