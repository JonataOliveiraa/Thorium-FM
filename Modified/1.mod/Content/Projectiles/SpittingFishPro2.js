import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Effects, Rand, Vector2 } = Modules;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const DUST_WATER = 33;
const LIFETIME = 180;
const TRAIL_AFTER = 178;
const IMMUNE_FRAMES = 10;
const VANILLA_ARROW = 1;

let _splash = null;

export class SpittingFishPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = 1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.extraUpdates = 4;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 90;
        this.AIType = VANILLA_ARROW;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);

        if (local[0] === 0) {
            local[0] = 1;
            if (_splash === null) _splash = Terraria.ID.SoundID.Splash;
            Effects.PlaySound(_splash, proj.Center.X | 0, proj.Center.Y | 0);
        }

        if (proj.timeLeft >= TRAIL_AFTER) return;

        for (let i = 0; i < 2; i++) {
            const dust = NewDustDirect(proj.Center, proj.width, proj.height, DUST_WATER, 0, 0, 125, Color.Transparent, 1.25);
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 0.2);
            dust.noGravity = true;
        }

        const still = NewDustDirect(proj.Center, proj.width, proj.height, DUST_WATER, 0, 0, 0, Color.Transparent, 1);
        if (still) {
            still.velocity = Vector2.Zero;
            still.noGravity = true;
        }
    }

    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = IMMUNE_FRAMES;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 10; i++) {
            const dust = NewDustDirect(proj.position, proj.width, proj.height, DUST_WATER, Rand.Next(-5, 5), Rand.Next(-5, 5), 100, Color.Transparent, 1.25);
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
