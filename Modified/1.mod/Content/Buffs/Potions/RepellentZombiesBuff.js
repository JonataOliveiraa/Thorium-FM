import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class RepellentZombiesBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/ZombieRepellentBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    ThoriumPlayer.repellentZombies = true;
  }
}
