import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class FrenzyPotionBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/FrenzyPotionBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    player.meleeSpeed += 0.10;
  }
}
