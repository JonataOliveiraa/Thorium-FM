import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModHealerItem } from '../../../Common/ModHealerItem.js';

const { Vector2 } = Modules;

export class Omen extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
        this.radiantLifeCost = 2;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.mana = 5;
        this.Item.damage = 26;
        this.Item.width = this.Item.height = 30;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 35, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('OmenPro');
        this.Item.shootSpeed = 8.0;
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player.Heal(this.radiantLifeCost / 2);
        return true;
    }
    
    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(19, 10)
        .AddIngredient(ModItem.getTypeByName('UnholyShards'), 10)
        .AddIngredient(175, 4)
        .AddTile(16)
        .Register();
        
        this.CreateRecipe(1)
        .AddIngredient(706, 10)
        .AddIngredient(ModItem.getTypeByName('UnholyShards'), 10)
        .AddIngredient(175, 4)
        .AddTile(16)
        .Register();
    }
}
