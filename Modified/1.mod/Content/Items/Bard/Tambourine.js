import { ModBardItem } from '../../../Common/ModBardItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { Empowerments } from '../../Global/Empowerments.js';

export class Tambourine extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.useWheel = true;
        this.inspirationCost = 1;
        this.instrumentStyle = 'Percussion'
    }

    SetDefaults() {
        this.Item.width = 32;
        this.Item.height = 32;

        this.Item.value = Terraria.Item.sellPrice(0, 0, 1, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.maxStack = 1

        this.SetWeaponValues(11, 5, 4);
        this.SetDefaultWeaponStyle(25, false);

        this.Item.useAnimation = 20;
        this.Item.useTime = 20;
        this.Item.autoReuse = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noUseGraphic = true;

        this.Item.shoot = ModProjectile.getTypeByName("TambourinePro");
        this.Item.shootSpeed = 8;
    }

    CanUseItem(item, player) {
        if (!super.CanUseItem(item, player)) return false;
        return player.ownedProjectileCounts[this.Item.shoot] < 1;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, "MovementSpeed", 1);
        }
        return true;
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(Terraria.ID.ItemID.Wood, 10)
        .AddIngredient(Terraria.ID.ItemID.IronBar, 3)
        .AddRecipeGroup(Terraria.ID.RecipeGroups.IronBar)
        .AddTile(Terraria.ID.TileID.WorkBenches)
        .Register();
    }
}