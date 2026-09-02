import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

export class VampirePickaxe extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.pick = 60;
        this.Item.melee = true;
        this.SetWeaponValues(8, 2, 4);
        this.Item.useTime = 11;
        this.Item.useAnimation = 18;
        this.Item.useStyle = 1;
        this.Item.autoReuse = true;
        this.Item.useTurn = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 35, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    HoldItem(item, player) {
        ThoriumPlayer.itemVampirePickaxe = true;
    }
}
