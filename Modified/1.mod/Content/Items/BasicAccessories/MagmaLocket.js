import { ModBuff } from "../../../TL/ModBuff.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModPlayer } from "../../../TL/ModPlayer.js";

export class MagmaLocket extends ModItem {
    constructor() {
        super();
        this.Texture = "Textures/Items/BasicAccessories/" + this.constructor.name;
    }

    SetDefaults() {
        this.Item.accessory = true;
        this.Item.material = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 2, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        if(player.lavaWet) {
            player.AddBuff(ModBuff.getTypeByName('LavaHugBuff'), 600, false)
        }
    }
}