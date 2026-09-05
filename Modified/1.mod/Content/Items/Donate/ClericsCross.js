import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModHealerItem } from '../../../Common/ModHealerItem.js';

const { Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ClericsCross extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.damage = 10;
        this.Item.mana = 5;
        this.Item.useTime = 24;
        this.Item.useAnimation = 24;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 1, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item19;
        this.Item.shoot = ModProjectile.getTypeByName('ClericsCrossPro');
        this.Item.shootSpeed = 7.5;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const source = player.GetProjectileSource_Item(item);
        player.direction = velocity.X > 0 ? 1 : -1;
        if (player.direction > 0) {
            NewProjectile(source, player.Center.X, player.Center.Y, 6.0, 0.0, type, damage, knockBack, player.whoAmI, 1.0, 0.0, 0.0, null);
        } else {
            NewProjectile(source, player.Center.X, player.Center.Y, -6.0, 0.0, type, damage, knockBack, player.whoAmI, 0.0, 0.0, 0.0, null);
        }
        return false;
    }

    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(9, 20)
        .AddIngredient(ModItem.getTypeByName('PurifiedShards'), 8)
        .AddTile(18)
        .Register();
    }
}
