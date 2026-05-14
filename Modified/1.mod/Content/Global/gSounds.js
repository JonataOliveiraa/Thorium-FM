import { GlobalNPC } from "../../TL/GlobalNPC.js";
import { Terraria } from "../../TL/ModImports.js";

export class gSounds extends GlobalNPC {
    constructor() {
        super()
    }

    static toRemove = [
        
    ]

    static toAdd = [
        {
            npc: Terraria.ID.NPCID.BlueSlime,
            id: Terraria.ID.SoundID.Item1
        }
    ]

    SetDefaults() {

    }
}