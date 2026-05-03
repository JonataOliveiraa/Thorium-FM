import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class Zephyr extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/ThunderBird/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.damage = 5;
    this.Item.ranged = true;
    this.Item.maxStack = 9999;
    this.Item.consumable = true;
    this.Item.knockBack = 2;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 5);
    this.Item.rare = Terraria.ID.ItemRarityID.White;
    this.Item.shoot = ModProjectile.getTypeByName("ZephyrP");
    this.Item.shootSpeed = 3.5;
    this.Item.ammo = 40; // Arrow
  }
}