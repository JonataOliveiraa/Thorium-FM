import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

export class Nocturne extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentType = 'String';
        this.inspirationCost = 2;
    }

    SetDefaults() {
        super.SetDefaults();
        this.Item.damage = 50;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.autoReuse = true;
        this.Item.noMelee = true;
        this.Item.knockBack = 5.0;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('NocturnePro');
        this.Item.shootSpeed = 6.0;
    }

    HoldoutOffset(item) {
        return { X: -4, Y: -4 };
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('nocturneSound');
            Empowerments.Apply(player, 'InvincibilityFrames', 1);
            Empowerments.Apply(player, 'LifeRegeneration', 1);
        }
        return true;
    }
}
