import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";

export class JellyfishResonator extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Consumable/' + this.constructor.name;
    }

    SetDefaults() {
        const item = this.Item;

        item.maxStack = 99;
        item.consumable = true;
        item.rare = Terraria.ID.ItemRarityID.Blue; 
        item.useStyle = 4;
    }

    CanUseItem(item, player) {
        return true;
    }

    UseItem(item, player) {
        Effects.PlaySound(Terraria.ID.SoundID.Roar, player.Center.x, player.Center.y, 0, 1.0, 1.0)
        return true; 
    }
}