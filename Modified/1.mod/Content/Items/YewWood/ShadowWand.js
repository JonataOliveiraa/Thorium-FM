import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { ArcaneArmorFabricator } from '../../Global/Tiles/ArcaneArmorFabricator.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class ShadowWand extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/YewWood/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 5;
        Terraria.Item.staff[this.Type] = true;
        this.Item.shoot = ModProjectile.getTypeByName('ShadowWandPro');
        this.Item.shootSpeed = 7;

        this.SetWeaponValues(15, 4, 4);
        this.SetDefaultWeaponStyle(18, true);

        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item103;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('YewWood'), 16)
            .AddIngredient(ModItem.getTypeByName('UnholyShards'), 5)
            .AddIngredient(Terraria.ID.ItemID.Amethyst, 2)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }

    ModifyShootStats(item, player, stats) {
        const dir = Vector2.Normalize(stats.velocity);
        stats.position = Vector2.Add(stats.position, Vector2.Multiply(dir, 45));
    }
}