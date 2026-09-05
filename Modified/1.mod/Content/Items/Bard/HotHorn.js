import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ModBardItem } from './../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';
import { ThoriumSoundPlayer } from '../../../Common/ThoriumSoundPlayer.js';

export class HotHorn extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Brass';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.damage = 30;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.autoReuse = true;
        this.Item.noMelee = true;
        this.Item.knockBack = 6.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item139;
        this.Item.shoot = ModProjectile.getTypeByName('HotHornPro');
        this.Item.shootSpeed = 5.0;
    }
    
    HoldoutOffset(item, player) {
        return { X: -6, Y: 0 };
    }
    
    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            ThoriumSoundPlayer.Play('bardHorn');
            Empowerments.Apply(player, 'FlatDamage', 2);
        }
        return true;
    }
    
    // 75 e o item cru do decompilado, mantido como estava
    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(175, 15)
        .AddTile(16)
        .Register();
    }
}
