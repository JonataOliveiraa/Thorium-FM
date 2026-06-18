import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class PadOPaper extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Bard/' + this.constructor.name;
  }

  SetDefaults() {
    this.Item.width = 24;
    this.Item.height = 28;
    this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
    this.Item.rare = Terraria.ID.ItemRarityID.White
    this.Item.accessory = true;
  }

  UpdateAccessory(item, player, vanity) {
    if (vanity) return;
    ThoriumPlayer.class.Bard.inspirationRegenBonus += 0.1;
  }

  ModifyTooltipLines() {
    // this.TooltipLines[0] = ModLocalization.Translate('ItemTooltip.symphonicDamage').replace('{0}', this.percetageDamage * 100)
  }
}