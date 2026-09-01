import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class SuspiciousMoisturizerBottle extends ModItem {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 22;
        this.Item.height = 36;
        this.Item.damage = 0;
        this.Item.noMelee = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 5, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Master;
        this.Item.shoot = ModProjectile.getTypeByName('SuspiciousMoisturizerBottlePro');
        this.Item.buffType = ModBuff.getTypeByName('SuspiciousMoisturizerBottleBuff');
    }

    UseItem(item, player) {
        player.AddBuff(item.buffType, 3600, false);
        return true;
    }
}
