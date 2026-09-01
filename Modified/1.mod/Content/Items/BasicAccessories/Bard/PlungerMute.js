import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { gRecipes } from '../../../Global/gRecipes.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';
import { ArcaneArmorFabricator } from '../../../Global/Tiles/ArcaneArmorFabricator.js';

export class PlungerMute extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BasicAccessories/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 24;
    this.Item.value = Terraria.Item.sellPrice(0,0,30,0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity) {
    if (vanity) return;

    ThoriumPlayer.class.Bard.symphonicCrit += 6;
    ThoriumPlayer.PlungerMuteActive = true;
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('SmoothCoal'), 10)
      .AddRecipeGroup(gRecipes.CustomGroups.get('SilverBar'))
      .AddIngredient(Terraria.ID.ItemID.SilverBar, 6)
      .AddTile(ArcaneArmorFabricator.Type)
      .Register()
  }
}
