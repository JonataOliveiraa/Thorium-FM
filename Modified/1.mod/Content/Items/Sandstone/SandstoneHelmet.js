import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class SandstoneHelmet extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Sandstone/' + this.constructor.name;
  }

  SetDefaults() {
    // Stats
    this.Item.defense = 1;

    // Other
    this.Item.value = Terraria.Item.sellPrice(0, 0, 6, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
  }

  UpdateEquip(item, player) {
    player.moveSpeed += 0.02;
    player.rangedDamage += 0.05;
  }

  AddArmorSets() {
    this.CreateArmorSet(
      this.Type,
      ModItem.getTypeByName("SandstoneMail"),
      ModItem.getTypeByName("SandstoneGreaves"),
      "Desert winds have granted you a sandy double jump"
    );
  }

  UpdateArmorSet(item, player) {
    player.hasJumpOption_Sandstorm = true
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName("SandstoneIngot"), 6)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }
}