import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

const StartRain = Terraria.Main['void StartRain(bool instant, Nullable`1 strengthOverride, bool garenteeCoinRain)'];
const StopRain  = Terraria.Main['void StopRain(bool instant)'];
const NewText   = Terraria.Main['void NewText(string newText, byte R, byte G, byte B)'];

export class RainStone extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Depth/' + this.constructor.name;
    }

    SetDefaults() {
        const item = this.Item;
        item.maxStack = 1;
        item.rare = Terraria.ID.ItemRarityID.Blue;
        item.useStyle = 4;
        item.UseSound = Terraria.ID.SoundID.Item4;
    }

    CanUseItem(item, player) {
        return true;
    }

    UseItem(item, player) {
        if (Terraria.Main.raining) {
            StopRain(false);
        } else {
            StartRain(false, null, false);
        }

        return true;
    }
}