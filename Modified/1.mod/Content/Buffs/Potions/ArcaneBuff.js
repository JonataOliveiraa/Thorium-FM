import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class ArcaneBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/ArcanePotionBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    player.statManaMax2 += 20;
    player.manaRegenBonus += 2;
  }
}
