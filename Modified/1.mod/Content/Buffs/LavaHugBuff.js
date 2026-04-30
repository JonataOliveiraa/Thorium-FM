import { Terraria } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { ThoriumPlayer } from "../Global/ThoriumPlayer.js";

export class LavaHugBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
        this.HealValue = 5
        this.ManaValue = 5
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.LavaHugBuffDelayTime++;
        
        if (ThoriumPlayer.LavaHugBuffDelayTime >= 120) {
            player.Heal(this.HealValue);

            player.statMana += this.ManaValue;
            player.ManaEffect(this.ManaValue)
            ThoriumPlayer.LavaHugBuffDelayTime = 0 
        }
    }
}