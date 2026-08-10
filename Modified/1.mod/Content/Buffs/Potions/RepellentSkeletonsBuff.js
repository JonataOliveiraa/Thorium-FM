import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class RepellentSkeletonsBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/SkeletonRepellentBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    ThoriumPlayer.repellentSkeletons = true;
  }
}
