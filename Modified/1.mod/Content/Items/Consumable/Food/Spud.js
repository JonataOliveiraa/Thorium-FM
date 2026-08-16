import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

export class Spud extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.damage = 6;
    this.Item.ranged = true;
    this.Item.width = 14;
    this.Item.height = 14;
    this.Item.maxStack = 9999;
    this.Item.consumable = true;
    this.Item.knockBack = 6;
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 3);
    // `ammo` define a classe de municao (a propria batata); `shoot` define no que
    // ela se transforma ao ser disparada. Faltava o segundo, entao mesmo com a
    // municao equipada nao havia projetil nenhum para nascer.
    this.Item.ammo = this.Type;
    this.Item.shoot = ModProjectile.getTypeByName('SpudPro');
    this.Item.shootSpeed = 12;
  }
}
