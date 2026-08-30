import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';

export class Jelly extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Consumable/' + this.constructor.name;
        this._buffType = -1;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 17;
        this.Item.useAnimation = 17;
        this.Item.useStyle = 9;
        this.Item.useTurn = true;
        this.Item.healLife = 75;
        this.Item.consumable = true;
        this.Item.potion = true;
        this.Item.maxStack = 9999;
        this.Item.rare = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item3;
    }

    UseItem(item, player) {
        if (this._buffType === -1) this._buffType = ModBuff.getTypeByName('JellyBuff') ?? -2;
        if (this._buffType > 0) player.AddBuff(this._buffType, 1200, false);
        return true;
    }
}
