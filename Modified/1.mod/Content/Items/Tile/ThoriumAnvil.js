import { ModRecipe } from '../../../TL/ModRecipe.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ThoriumAnvil extends ModItem {
    static anvilGroup = null;

    constructor() {
        super();
        this.Texture = 'Items/Tile/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.maxStack = ModItem.CommonMaxStack;
        this.Item.value = Terraria.Item.buyPrice(0, 0, 20, 78);
        this.Item.material = false;
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.DefaultToPlaceableTile(Terraria.ID.TileID.ChlorophyteExtractinator, 0);
    }

    AddRecipeGroups() {
        if (!ThoriumAnvil.anvilGroup) {
            const itemIds = [Terraria.ID.ItemID.IronAnvil, Terraria.ID.ItemID.LeadAnvil];
            ThoriumAnvil.anvilGroup = this.CreateRecipeGroup(itemIds);
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumOre'), 10)
            .AddRecipeGroup(ThoriumAnvil.anvilGroup)
            .AddIngredient(Terraria.ID.ItemID.IronAnvil)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}