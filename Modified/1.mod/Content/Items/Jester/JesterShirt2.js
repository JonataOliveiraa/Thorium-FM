import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const ItemID = Terraria.ID.ItemID

export class JesterShirt2 extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Jester/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 90, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    UpdateEquip() {
        ThoriumPlayer.equipJesterShirt = true
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ItemID.Silk, 7)
            .AddIngredient(ItemID.DemoniteBar, 20)
            .AddIngredient(ItemID.ShadowScale, 15)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}