import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Rand, Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class Eelrod extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 60;
        this.Item.magic = true;
        this.Item.damage = 13;
        this.Item.mana = 10;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 0.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 40, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item34;
        this.Item.shoot = ModProjectile.getTypeByName('EelSpark');
        this.Item.shootSpeed = 8.0;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockback) {
        const vector2 = Vector2.Multiply(Vector2.Normalize(velocity), 25);
        if (CanHit(position, 0, 0, Vector2.Add(position, vector2), 0, 0)) {
            position = Vector2.Add(position, vector2);
        }
        player.direction = (position.X + velocity.X) < player.Center.X ? -1 : 1;
        let num1 = 0.25,
        num2 = velocity['float Length()'](),
        num3 = Math.atan2(velocity.X, velocity.Y),
        num4 = num3 + 0.5 * num1,
        num5 = num3 + 0.25 * num1,
        num6 = num3,
        num7 = num3 - 0.25 * num1,
        num8 = num3 - 0.5 * num1,
        num9 = Rand.NextFloat() * 0.20000000298023224 + 0.949999988079071;
        velocity.X = num2 * num9 * Math.sin(num4);
        velocity.Y = num2 * num9 * Math.cos(num4);
        const source = player.GetProjectileSource_Item(item);
        NewProjectile(source, position.X, position.Y, num2 * num9 * Math.sin(num4), num2 * num9 * Math.cos(num4), type, damage, knockback, player.whoAmI, 0.0, 0.0, 0.0, null);
        NewProjectile(source, position.X, position.Y, num2 * num9 * Math.sin(num8), num2 * num9 * Math.cos(num8), type, damage, knockback, player.whoAmI, 0.0, 0.0, 0.0, null);
        NewProjectile(source, position.X, position.Y, num2 * num9 * Math.sin(num5), num2 * num9 * Math.cos(num5), type, damage, knockback, player.whoAmI, 0.0, 0.0, 0.0, null);
        NewProjectile(source, position.X, position.Y, num2 * num9 * Math.sin(num7), num2 * num9 * Math.cos(num7), type, damage, knockback, player.whoAmI, 0.0, 0.0, 0.0, null);
        NewProjectile(source, position.X, position.Y, num2 * num9 * Math.sin(num6), num2 * num9 * Math.cos(num6), type, damage, knockback, player.whoAmI, 0.0, 0.0, 0.0, null);
        return false;
    }
}