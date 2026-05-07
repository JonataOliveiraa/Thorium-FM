import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class AquamarineRing extends ModItem {
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

        ThoriumPlayer.class.Healer.radiantDamage += 1
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }
    
    AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.IronBar, 1)
      .AddRecipeGroup('IronBar')
      .AddIngredient(ModItem.getTypeByName('AquamarineGem'), 1)
      .AddIngredient(75, 1)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}
