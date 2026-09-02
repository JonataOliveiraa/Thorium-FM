import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';

const MOVE_BONUS = 0.15;
const MINE_BONUS = 0.15;

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
    player.moveSpeed += MOVE_BONUS;
    player.pickSpeed -= MINE_BONUS;
  }
}
