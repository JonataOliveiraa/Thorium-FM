import { ModBuff } from "../../TL/ModBuff.js";
import { Terraria } from "../../TL/ModImports.js";

export class SheathBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.buffNoSave[this.Type] = true;
        Terraria.Main.buffNoTimeDisplay[this.Type] = true;
    }
}