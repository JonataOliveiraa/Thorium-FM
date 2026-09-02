import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const BUFF_TIME = 3600;

export class CloudyChewToy extends ModItem {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 38;
        this.Item.height = 32;
        this.Item.damage = 0;
        this.Item.noMelee = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.UseSound = Terraria.ID.SoundID.Item2;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.LightRed;
        this.Item.shoot = ModProjectile.getTypeByName('WyvernPet');
        this.Item.buffType = ModBuff.getTypeByName('WyvernPetBuff');
    }

    UseItem(item, player) {
        player.AddBuff(item.buffType, BUFF_TIME, false);
        return true;
    }
}
