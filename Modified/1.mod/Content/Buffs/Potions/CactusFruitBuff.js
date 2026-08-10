import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class CactusFruitBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/CactusFruitBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    player.statDefense += 2;
    player.thorns = 0.5;
  }
}
