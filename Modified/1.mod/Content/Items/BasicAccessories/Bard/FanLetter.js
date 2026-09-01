import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

const { ItemRarityID } = Terraria.ID;

export class FanLetter extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/BasicAccessories/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 24;
    this.Item.accessory = true;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 50, 0);
    this.Item.rare = ItemRarityID.Blue;
  }

  UpdateAccessory(item, player, vanity, hideVisual) {
    if (vanity) return;

    ThoriumPlayer.class.Bard.inspirationMax2 += 3;
  }
}
