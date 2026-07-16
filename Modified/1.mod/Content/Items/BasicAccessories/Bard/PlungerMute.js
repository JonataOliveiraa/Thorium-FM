import { ModBardItem } from '../../../../Common/ModBardItem.js';
import { ModHealerItem } from '../../../../Common/ModHealerItem.js';
import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { gRecipes } from '../../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';
import { ThoriumAnvil } from '../../../Global/Tiles/ThoriumAnvil.js';

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

    if (ModBardItem.bardItemsName.has(type)) {
      ThoriumPlayer.PlungerMuteActive = true;
    }
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 10)
      .AddRecipeGroup(gRecipes.CustomGroups.get('SilverBar'))
      .AddIngredient(Terraria.ID.ItemID.SilverBar, 6)
      .AddTile(ThoriumAnvil.Type)
      .Register()
  }
}