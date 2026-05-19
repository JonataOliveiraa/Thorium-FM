import { Terraria } from "../../../../TL/ModImports.js";
import { ModItem } from "../../../../TL/ModItem.js";

export class SoulStone extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Summon/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        ;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.minionDamage += 0.10;
        player.statLifeMax2 -= 20;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ManaBauble'), 1)
            .AddIngredient(ModItem.getTypeByName('Blood'), 5)
            .AddTile(Terraria.ID.TileID.DemonAltar)
    }
}