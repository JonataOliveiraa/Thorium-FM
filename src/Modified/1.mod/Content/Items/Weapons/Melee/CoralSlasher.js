import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';

export class CoralSlasher extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.melee = true;
    this.SetWeaponValues(11, 2, 4);
    this.SetDefaultWeaponStyle(22, true);

    this.Item.value = Terraria.Item.sellPrice(0, 0, 22, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
  }
}