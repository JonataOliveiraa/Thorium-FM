import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class WebGunPro1 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 28;
        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Arrow;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.ignoreWater = false;
        this.Projectile.tileCollide = true;
        this.Projectile.extraUpdates = 1;
    }

    OnKill(proj, timeLeft) {

        NewProjectile(
            proj.GetProjectileSource_FromThis(),
            Vector2.new(proj.Center.X, proj.Center.Y),
            Vector2.new(0, 0),
            ModProjectile.getTypeByName('WebGunPro2'),
            proj.originalDamage,
            0,
            proj.owner,
            0, 0, 0, null
        );
    }
}
