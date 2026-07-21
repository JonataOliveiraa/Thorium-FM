import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js'
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const ItemID = Terraria.ID.ItemID

export class JesterMask extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Jester/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 4;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName("JesterShirt"),
      ModItem.getTypeByName("JesterLeggings"),
      ModLocalization.getTranslationArmorSetBonus("Jester")
    );
  }

  UpdateArmorSet(item, player) {
    ThoriumPlayer.setJester = true;
  }

  UpdateEquip() {
    ThoriumPlayer.class.Bard.symphonicCrit += 11
  }

  AddRecipes() {
      this.CreateRecipe(1)
        .AddIngredient(ItemID.Silk, 3)
        .AddIngredient(ItemID.CrimtaneBar, 10)
        .AddIngredient(ItemID.TissueSample, 5)
        .AddTile(Terraria.ID.TileID.Anvils)
        .Register();
    }
}