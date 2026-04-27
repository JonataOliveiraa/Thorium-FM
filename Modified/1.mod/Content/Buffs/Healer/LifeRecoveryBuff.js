import { Terraria } from "../../../TL/ModImports.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { ModPlayer } from "../../../TL/ModPlayer.js";

export class LifeRecoveryBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/Healer/" + this.constructor.name;
        this.HealValue = 1
    }

    UpdatePlayer(player, buffIndex) {
        ModPlayer.getByName("gPlayer").LifeRecoveryBuffDelayTime++;
        
        if (ModPlayer.getByName("gPlayer").LifeRecoveryBuffDelayTime >= 60) {
            player.Heal(this.HealValue);
            ModPlayer.getByName("gPlayer").LifeRecoveryBuffDelayTime = 0 
        }
    }
}