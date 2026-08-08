import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class GraniteReflector extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Granite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.melee = true;
        this.SetWeaponValues(30, 6, 4);
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('GraniteReflectorPro');
        this.Item.shootSpeed = 12;
    }

    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('GraniteEnergyCore'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
