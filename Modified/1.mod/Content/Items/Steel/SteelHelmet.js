import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class SteelHelmet extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Steel/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 4;
    this.Item.value = Terraria.Item.buyPrice(0, 0, 75, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.maxStack = 1
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName("SteelChestplate"),
      ModItem.getTypeByName("SteelGreaves"),
      ModLocalization.getTranslationArmorSetBonus("Steel")
    );
  }

  UpdateArmorSet(item, player) {
    player.endurance += 0.08
  }
}