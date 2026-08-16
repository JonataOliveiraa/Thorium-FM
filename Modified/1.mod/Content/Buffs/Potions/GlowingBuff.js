import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { Effects } from '../../../TL/Modules/Effects.js';

export class GlowingBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/GlowingBuff";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    Effects.AddLight(player.Center, 0.8, 0.8, 0.2);
    player.radiantBoost = (player.radiantBoost || 0) + 0.10;
  }
}
