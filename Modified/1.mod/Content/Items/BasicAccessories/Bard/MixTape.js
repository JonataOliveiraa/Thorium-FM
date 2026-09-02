import { Terraria } from "../../../../TL/ModImports.js";
import { ModItem } from "../../../../TL/ModItem.js";
import { ThoriumPlayer } from "../../../Global/ThoriumPlayer.js";

export class MixTape extends ModItem {
    constructor() {
        super();
        this.Texture = "Items/BasicAccessories/Bard/" + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 25, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        ThoriumPlayer.accMixtape = true;
    }
}
