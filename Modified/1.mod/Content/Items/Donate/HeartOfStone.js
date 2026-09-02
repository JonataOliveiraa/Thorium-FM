import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { Main } = Terraria;

const BASE_DEFENSE = 1;
const DEPTH_DIVISIONS = 10;

export class HeartOfStone extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 15, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        const step = Main.maxTilesY / DEPTH_DIVISIONS;
        const depth = Math.floor(Math.floor(player.position.Y / 16) / step);

        player.statDefense += BASE_DEFENSE + depth;
    }
}
