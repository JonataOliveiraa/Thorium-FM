import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class BloodPotionBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = "Buffs/BloodRush";
  }

  SetStaticDefaults() {
    Terraria.Main.buffNoSave[this.Type] = false;
    Terraria.Main.buffNoTimeDisplay[this.Type] = false;
  }

  UpdatePlayer(player, buffIndex) {
    if (!player || !player.active) return;
    if (player.statLife < player.statLifeMax2) {
      const missing = player.statLifeMax2 - player.statLife;
      player.lifeRegen += Math.floor(missing / 20);
    }
  }
}
