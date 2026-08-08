import { Terraria } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';

export class GraniteSurgeBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    // Dano por segundo em unidades de lifeRegen (2 = 1 hp/s)
    static Damage = 8;
    // Quanto dano extra o alvo toma enquanto estiver sobrecarregado
    static DamageTakenBonus = 0.05;

    SetStaticDefaults() {
        Terraria.Main.debuff[this.Type] = true;
        Terraria.Main.pvpBuff[this.Type] = true;
        Terraria.Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        if (player.lifeRegen > 0) player.lifeRegen = 0;
        player.lifeRegenTime = 0;
        player.lifeRegen -= GraniteSurgeBuff.Damage;
    }
}
