import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Rand, Effects } = Modules;
const { Main } = Terraria;

const LIFETIME = 24;
const DUST_TYPE = 0;
const DRAG = 0.92;
// 1 particula a cada 3 ticks, e nao 2 por tick. Com 3 respingos vivos ao mesmo
// tempo o valor antigo gerava ~270 poeiras por batata - virava uma nuvem opaca.
const DUST_INTERVAL = 3;

export class SpudSplatter extends ModProjectile {
    constructor() {
        super();
        // Invisivel: a nuvem e' inteiramente feita de poeira.
        this.Texture = 'Projectiles/Empty';
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.tileCollide = false;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 12;
    }

    AI(proj) {
        const velocity = proj.velocity;
        velocity.X *= DRAG;
        velocity.Y = velocity.Y * DRAG + 0.12;
        proj.velocity = velocity;

        if (proj.timeLeft % DUST_INTERVAL !== 0) return;

        const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, DUST_TYPE, Rand.NextFloat(-1, 1), Rand.NextFloat(-1, 1), 100, Color.White, 1);
        Main.dust[dustIndex].noGravity = true;
    }
}
