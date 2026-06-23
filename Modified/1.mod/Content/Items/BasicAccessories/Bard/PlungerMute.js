import { ModBardItem } from '../../../../Common/ModBardItem.js';
import { ModHealerItem } from '../../../../Common/ModHealerItem.js';
import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class PlungerMute extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BasicAccessories/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 28;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity) {
    if (vanity) return;
    const type = player.HeldItem.type
    ThoriumPlayer.class.Bard.symphonicCrit += 6;

    if(ModBardItem.bardItemsName.has(type)) {
      ThoriumPlayer.PlungerMuteActive = true;
    }
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.Leather)
      .AddIngredient(ModItem.getTypeByName('Cloth'))
      .AddTile(Terraria.ID.TileID.Anvils)
  }
}