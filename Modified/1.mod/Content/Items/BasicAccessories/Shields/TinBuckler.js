import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

export class TinBuckler extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 3, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.accessory = true;
        this.Item.defense = 1;
        }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.statLifeMax2 += 9;
    }
    
        AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(703, 10)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}