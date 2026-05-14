import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class ShadowflameStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/YewWood/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 10;
        Terraria.Item.staff[this.Type] = true;
        this.Item.shoot = ModProjectile.getTypeByName('ShadowflameStaffPro');
        this.Item.shootSpeed = 5;

        this.SetWeaponValues(20, 4, 10);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('YewWood'), 16)
            .AddIngredient(Terraria.ID.ItemID.Amethyst, 3)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}