import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class BubbleConch extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Depth/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.magic = true;
    this.Item.noMelee = true;
    this.Item.mana = 20;

    this.SetWeaponValues(23, 6, 4);
    this.SetDefaultWeaponStyle(32, true);
    this.Item.useStyle = 13;
    
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 4, 25);
    this.Item.UseSound = Terraria.ID.SoundID.Item87;
  }
}