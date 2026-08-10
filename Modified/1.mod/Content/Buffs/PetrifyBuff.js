import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';

export class PetrifyBuff extends ModBuff {
  constructor() {
    super();
    this.Texture = 'Buffs/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.debuff[this.Type] = true;
  }

  ApplyNPC(npc, buffTime) {
    npc.velocity = Vector2.Zero;
  }
}
