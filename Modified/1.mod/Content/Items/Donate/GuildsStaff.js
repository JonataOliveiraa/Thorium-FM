import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class GuildsStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 0;
        this.Item.noMelee = true;
        this.Item.width = 28;
        this.Item.height = 28;
        this.Item.useStyle = 5;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.UseSound = Terraria.ID.SoundID.Item2;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('LittleNecromancer');
        this.Item.buffType = ModBuff.getTypeByName('LittlePhylacteryBuff');
    }

    HoldoutOffset(item, player) {
        return { X: -2, Y: -14 };
    }

    UseItem(item, player) {
        if (item.buffType > 0) player.AddBuff(item.buffType, 3600, false);
        return true;
    }
}
