import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class JunglesWrath extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(17, 3, 0);
        this.Item.magic = true;
        this.Item.mana = 14;
        this.Item.width = 60;
        this.Item.height = 60;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item156;
        this.Item.shootSpeed = 10;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('JunglesWrathPro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    HoldoutOffset(item, player) {
        return { X: 0, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 12)
            .AddIngredient(Terraria.ID.ItemID.Stinger, 4)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
