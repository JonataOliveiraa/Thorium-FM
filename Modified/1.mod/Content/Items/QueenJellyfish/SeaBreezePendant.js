import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const BUFF_TIME = 2;

let _aptitudeType = -1;

export class SeaBreezePendant extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.expert = true;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.accFlipper = true;
        ThoriumPlayer.accSeaBreezePendant = true;

        if (!player.wet) return;

        if (_aptitudeType === -1) _aptitudeType = ModBuff.getTypeByName('AquaticAptitude') ?? -2;
        if (_aptitudeType < 0) return;

        player.AddBuff(_aptitudeType, BUFF_TIME, true);
    }
}
