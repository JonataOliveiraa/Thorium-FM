import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Color } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const DUST_STONE = 1;
const HIT_DUSTS = 10;
const HIT_RISE = -3;
const HIT_EXTRA_HEIGHT = 20;

export class GroundedTotemPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 120;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 20;
    }

    OnHitNPC(proj, npc) {
        for (let i = 0; i < HIT_DUSTS; i++) {
            const dust = Main.dust[NewDust(npc.position, npc.width, npc.height + HIT_EXTRA_HEIGHT, DUST_STONE, npc.velocity.X * 0.1, HIT_RISE, 75, Color.White, 1.25)];
            if (dust) dust.noGravity = true;
        }
    }
}
