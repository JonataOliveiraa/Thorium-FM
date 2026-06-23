import { ModItem } from "../../../../TL/ModItem.js";
import { Terraria } from "../../../../TL/ModImports.js";
import { ThoriumPlayer } from "../../../Global/ThoriumPlayer.js";

const { ItemRarityID, TileID, ItemID } = Terraria.ID;

export class FabergeEgg extends ModItem {
    constructor() {
        super();
        this.Texture = "Textures/Items/BasicAccessories/Bard/" + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.accessory = true;
        this.Item.rare = ItemRarityID.Blue;
        this.Item.value = 50000;
    }

    UpdateAccessory(player, hideVisual) {
        ThoriumPlayer.FabergeEggEquipped = true;
    }

    AddRecipes() {
        const recipe = this.CreateRecipe();
        recipe.AddIngredient(ItemID.GoldBar, 8);
        recipe.AddIngredient(ItemID.Feather, 5);
        recipe.AddTile(TileID.Anvils);
        recipe.Register();
    }
}