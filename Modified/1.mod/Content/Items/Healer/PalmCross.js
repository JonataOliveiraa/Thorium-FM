import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

export class PalmCross extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(10, 6, 0);
        this.Item.mana = 5;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.reuseDelay = 10;
        this.Item.useStyle = 5;
        this.Item.channel = true;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.shoot = ModProjectile.getTypeByName('PalmCrossPro');
        this.Item.shootSpeed = 0;
    }

    HoldoutOffset() {
        return { X: 4, Y: 12 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.CopperBar, 5)
            .AddIngredient(Terraria.ID.ItemID.Silk, 1)
            .AddIngredient(Terraria.ID.ItemID.Torch, 2)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}