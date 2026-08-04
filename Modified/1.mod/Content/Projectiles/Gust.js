import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const FRAMES = 5;
const FRAME_TIME = 1;
const DUST_CHANCE = 3;   // 1 em 3 ticks solta poeira
const DUST_TYPE = 10;
const DISSIPATE = 20;    // sobrevida depois de bater na parede

export class Gust extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 10;
        this.Projectile.timeLeft = 90;
        this.Projectile.alpha = 50;
    }

    // localAI guarda a velocidade do tick anterior, pra poder devolver ela
    // quando a rajada bate na parede (o TL nao passa oldVelocity)
    AI(proj) {
        const vel = proj.velocity;
        const local = new ProjAI(proj, true);
        local[0] = vel.X;
        local[1] = vel.Y;

        proj.rotation = 0.1 * vel.X;

        if (++proj.frameCounter > FRAME_TIME) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % FRAMES;
        }

        if (Math.random() * DUST_CHANCE >= 1) return;

        const dust = Main.dust[Effects.NewDust(
            proj.position, proj.width, proj.height,
            DUST_TYPE, vel.X * 0.25, vel.Y * 0.25, 125, WHITE, 1
        )];
        if (dust) dust.noGravity = true;
    }

    // Bateu na parede: para de causar dano e se desfaz no ar, sem morrer seco
    OnTileCollide(proj, hitDirection) {
        const local = new ProjAI(proj, true);

        proj.tileCollide = false;
        proj.friendly = false;
        proj.velocity = Vector2.new(local[0], local[1]);
        if (proj.timeLeft > DISSIPATE) proj.timeLeft = DISSIPATE;

        return false;
    }
}
