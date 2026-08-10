import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class HydrationBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/HydrationBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    ThoriumPlayer.hydrationBuff = true;
    player.statLifeMax2 += Math.floor(player.statLifeMax * 0.10);
    player.lifeRegen += 2;
  }
}
