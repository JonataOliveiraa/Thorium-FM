import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const DUST_FIRE = 6;
const DUST_EMBER = 127;
const TRAIL_FIRE = 4;
const TRAIL_EMBER = 2;
const TRAIL_DRAG = 0.2;

const SPIN = 0.06;
const BOUNCES = 4;
const IMPACT_DUSTS = 8;
const BURN_TIME = 90;

export class FieryTotemPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Minions/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = 8;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.friendly = true;
    }

    OnSpawn(proj) {
        new ProjAI(proj, true)[0] = BOUNCES;
    }

    AI(proj) {
        proj.rotation += (proj.velocity.X > 0 ? 1 : -1) * SPIN;

        const origin = Vector2.Subtract(proj.position, proj.velocity);

        for (let i = 0; i < TRAIL_FIRE; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, DUST_FIRE, 0, 0, 100, Color.White, 1.4)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, TRAIL_DRAG);
            dust.noGravity = true;
        }

        for (let i = 0; i < TRAIL_EMBER; i++) {
            const dust = Main.dust[NewDust(origin, proj.width, proj.height, DUST_EMBER, 0, 0, 100, Color.White, 0.8)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, TRAIL_DRAG);
            dust.noGravity = true;
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.OnFire, BURN_TIME, false);
    }

    OnTileCollide(proj, hitDirection) {
        for (let i = 0; i < IMPACT_DUSTS; i++) {
            const dust = Main.dust[NewDust(proj.position, proj.width, proj.height, DUST_FIRE, Rand.Next(-4, 4), Rand.Next(-4, 4), 0, Color.White, 1.2)];
            if (dust) dust.noGravity = true;
        }

        const local = new ProjAI(proj, true);
        if (local[0] <= 0) return true;

        local[0]--;
        proj.velocity = Vector2.new(-proj.velocity.X, -proj.velocity.Y);
        return false;
    }
}
