import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class JarOMayo extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 30;
    this.Item.height = 30;
    this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.Green;
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity) {
    if (vanity) return;
    ThoriumPlayer.accJarOMayo = true;
  }
}
