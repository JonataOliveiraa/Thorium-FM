import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

let _proType = -1;

export class Ukulele extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'String';
        this.inspirationCost = 2;
    }

    SetDefaults() {
        this.SetWeaponValues(10, 4, 0);
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 20);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item26;
        this.Item.shootSpeed = 5;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('UkulelePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    UseItem(item, player) {
        super.UseItem(item, player);

        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'Defense', 1);
        }

        return true;
    }

    HoldoutOffset(item, player) {
        return { X: -6, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.PalmWood, 8)
            .AddIngredient(Terraria.ID.ItemID.Seashell, 1)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
