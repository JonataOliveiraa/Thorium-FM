import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class AquaAffinityBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/AquaAffinity";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    player.ignoreWater = true;
    player.accFlipper = true;
    player.moveSpeed += 0.20;
  }
}
