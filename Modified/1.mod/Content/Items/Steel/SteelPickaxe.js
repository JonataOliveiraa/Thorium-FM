import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SteelPickaxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Steel/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.pick = 60;

    // Hitbox
    this.Item.width = 32;
    this.Item.height = 32;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(7, 2, 0);
    this.SetDefaultWeaponStyle(19, true);
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 1, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.maxStack = 1
  }
}