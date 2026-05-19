import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { CoralHelmet } from './CoralHelmet.js';

export class CoralGreaves extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Coral/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.defense = 3;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 13, 50);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
  }

  UpdateEquip(item, player) {
    CoralHelmet.ReduceDamage10Perc(player)
    ThoriumPlayer.LifeShieldHealValue += 1
  }

  AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(Terraria.ID.ItemID.Coral, 6)
      .AddTile(Terraria.ID.TileID.Anvils)
      .Register();
  }

  ModifyTooltipLines() {
    for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
      const line = this.TooltipLines[i];
      this.TooltipLines[i] = line
    }
  }
}