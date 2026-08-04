import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _proType = -1;

export class PearlPike extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.SkipsInitialUseSound[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(22, 5, 0);
        this.Item.melee = true;
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shootSpeed = 6;

        if (_proType === -1) _proType = ModProjectile.getTypeByName('PearlPikePro') ?? -2;
        if (_proType >= 0) this.Item.shoot = _proType;
    }

    CanUseItem(item, player) {
        return (player.ownedProjectileCounts[this.Item.shoot] ?? 0) < 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 8)
            .AddIngredient(Terraria.ID.ItemID.WhitePearl, 1)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
