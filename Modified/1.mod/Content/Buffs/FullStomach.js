import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';

export class FullStomach extends ModBuff {
  constructor() {
    super();
    this.Texture = 'Buffs/' + this.constructor.name;
  }

  SetStaticDefaults() {
    Terraria.Main.debuff[this.Type] = true;
    Terraria.Main.buffNoSave[this.Type] = true;
    // Nao ha' efeito passivo: o debuff so' existe para bloquear outra comida do
    // Cozinheiro, e a checagem vive no CanUseItem do ModCookFood.
    Terraria.Main.pvpBuff[this.Type] = false;
  }
}
