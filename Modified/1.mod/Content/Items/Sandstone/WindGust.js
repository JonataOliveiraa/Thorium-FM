import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class WindGust extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Sandstone/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(16, 10, 0);
        this.Item.magic = true;
        this.Item.mana = 5;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 8, 20);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item34;
        this.Item.shootSpeed = 7;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('Gust') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('SandstoneIngot'), 8)
            .AddIngredient(Terraria.ID.ItemID.Book, 1)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
