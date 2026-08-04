import { BardItemSound } from '../../../Common/Enum/BardItemSound.js';
import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

let _proType = -1;

export class Sitar extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'String';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.SetWeaponValues(18, 4, 6);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 25;
        this.Item.useAnimation = 25;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = BardItemSound.SuperGuitarNoise;
        this.Item.shootSpeed = 10;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('SitarWindBurst') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'InvincibilityFrames', 2);
        }

        return true;
    }

    HoldoutOffset(item, player) {
        return { X: -12, Y: 0 };
    }

    // 3380 e o item cru do decompilado, mantido como estava
    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Wood, 16)
            .AddIngredient(3380, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
