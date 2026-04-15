import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

export class AmethystRing extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Rings/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.armorPenetration += 1;
    }
    
    AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.IronBar, 1)
      .AddRecipeGroup('IronBar')
      .AddIngredient(181, 1)
      .AddIngredient(75, 1)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}