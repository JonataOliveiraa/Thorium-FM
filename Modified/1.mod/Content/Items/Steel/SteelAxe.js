import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class SteelAxe extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Steel/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.axe = 12;

    // Hitbox
    this.Item.width = 32;
    this.Item.height = 32;

    // Weapon Damage
    this.Item.melee = true;
    this.SetWeaponValues(8, 4.5, 0);
    this.SetDefaultWeaponStyle(24, true);
    this.Item.useStyle = 1;
    this.Item.useTurn = true

    // Other
    this.Item.value = Terraria.Item.buyPrice(0, 1, 25, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.UseSound = Terraria.ID.SoundID.Item1;
    this.Item.maxStack = 1
  }
}