// AquamarineWineGlassPro.js
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NewDustDirect = Terraria.Dust.NewDustDirect;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class AquamarineWineGlassPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = 14;
        this.Projectile.alpha = 30;
        this.Projectile.light = 0.15;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = true;
        this.Projectile.friendly = true;
        this.fadeOutTime = 30;
        this.fadeOutSpeed = 4;
    }

    GetAlpha(proj, lightColor) {
        if (proj.timeLeft > this.fadeOutTime) return Color.White;
        const factor = proj.timeLeft / this.fadeOutTime;
        return Color.new(255, 255, 255, Math.floor(255 * factor));
    }

    OnTileCollide(proj) {
        return false; 
    }

    OnKill(proj) {
        Effects.PlaySound(Terraria.ID.SoundID.Shatter, proj.Center.X, proj.Center.Y, 1, 0, 0.8);
        for (let i = 0; i < 10; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height,
                132,
                Rand.Next(-4, 4),
                Rand.Next(-4, 5),
                0, Color.White, 1
            );
            if (dust) dust.noGravity = true;
        }

        if (proj.owner !== Main.myPlayer) return;

        const shardType = ModProjectile.getTypeByName('AquamarineWineGlassPro2');
        const source = proj.GetProjectileSource_FromThis();
        for (let i = 0; i < 5; i++) {
            const vel = Vector2.new(
                Rand.Next(-5, 6),
                Rand.Next(-5, 6)
            );
            NewProjectile(source, proj.Center, vel, shardType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null);
        }
    }
}