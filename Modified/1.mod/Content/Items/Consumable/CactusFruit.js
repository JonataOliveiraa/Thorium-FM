import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';

let _buffType = -1;

export class CactusFruit extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 16;
    this.Item.height = 18;
    this.Item.useStyle = Terraria.ID.ItemUseStyleID.EatFood;
    this.Item.useAnimation = 17;
    this.Item.useTime = 17;
    this.Item.useTurn = true;
    this.Item.UseSound = Terraria.ID.SoundID.Item2;
    this.Item.maxStack = 9999;
    this.Item.consumable = true;
    this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);

    if (_buffType === -1) {
      _buffType = ModBuff.getTypeByName('CactusFruitBuff') ?? -2;
    }
    if (_buffType > 0) {
      this.Item.buffType = _buffType;
      this.Item.buffTime = 1800; // 30 segundos
    }
  }
}
