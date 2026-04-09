import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ModLocalization } from './../../TL/ModLocalization.js';
import { GlobalHooks } from './../../TL/GlobalHooks.js';
import { Subworld } from './../../TL/Subworld.js';
import { ModAchievement } from './../../TL/ModAchievement.js';

const NewText = Terraria.Main['void NewText(string newText, byte R, byte G, byte B)'];

export class gPlayer extends ModPlayer {
    constructor() {
        super();
    }
    LivingWoodAcornBuff = false
    ExampleDefenseDebuff = false;
    
    OnEnterWorld(player) {
    }
    
    ResetEffects(player) {
        this.LivingWoodAcornBuff = false;
    }
    
    UpdateEquips(player) {
        if (this.LivingWoodAcornBuff)
            player.statDefense *= this.DefenseDebuffMultiplier;
    }
    
    SendMessage(player, msg) {
        msg = msg.toLowerCase();
        
        if (msg === '/join') {
            // Example Join Subworld
            Subworld.Join('ExampleSubworld');
            return false;
        }
        else if (msg === '/leave') {
            // Example Leave Subworld
            Subworld.Leave();
            return false;
        }
        
        return true;
    }
}