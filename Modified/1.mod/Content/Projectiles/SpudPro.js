import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const SPLATTER_COUNT = 3;
const SPLATTER_SPEED = 3;
const SPLATTER_DAMAGE_SCALE = 0.6;
const DUST_TYPE = 0;

let splatterType = -1;

export class SpudPro extends ModProjectile {
    constructor() {
        super();
        // Reaproveita o sprite do item: a batata voando e' a mesma batata.
        this.Texture = 'Items/Consumable/Food/Spud';
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        // aiStyle 2 = arremesso com gravidade e giro, o arco de uma batata lancada.
        this.Projectile.aiStyle = 2;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.tileCollide = true;
    }

    OnKill(proj) {
        const center = proj.Center;
        const white = Color.White;

        for (let index = 0; index < 5; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, DUST_TYPE, Rand.NextFloat(-2, 2), Rand.NextFloat(-2, 2), 80, white, 1.1);
            Main.dust[dustIndex].noGravity = false;
        }

        if (splatterType < 0) splatterType = ModProjectile.getTypeByName('SpudSplatter') ?? -1;
        if (splatterType < 0) return;

        // A batata estoura num leque de respingos que ficam no ar por um instante.
        const damage = Math.max(1, Math.floor(proj.damage * SPLATTER_DAMAGE_SCALE));
        for (let index = 0; index < SPLATTER_COUNT; index++) {
            const angle = Math.PI * (0.25 + 0.25 * index);
            const velocity = Vector2.new(Math.cos(angle) * SPLATTER_SPEED, -Math.abs(Math.sin(angle)) * SPLATTER_SPEED);
            NEW_PROJECTILE(null, center, velocity, splatterType, damage, proj.knockBack * 0.5, proj.owner, 0, 0, 0, null);
        }
    }
}
