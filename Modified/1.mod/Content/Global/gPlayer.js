import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';

export class gPlayer extends ModPlayer {
    constructor() {
        super();
    }
    LivingWoodAcornArmorBuff = true
    
    OnEnterWorld(player) {
    }
    
    ResetEffects(player) {
        this.LivingWoodAcornArmorBuff = false;
    }
    
    UpdateEquips(player) {
        if (this.LivingWoodAcornArmorBuff) this.LivingWoodAcornArmorBuff = true;
    }
}