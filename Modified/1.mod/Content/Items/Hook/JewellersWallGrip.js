import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { ItemID, TileID } = Terraria.ID;

export class JewellersWallGrip extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Hook/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.noUseGraphic = true;
        this.Item.noMelee = true;
        this.Item.shootSpeed = 15;
        this.Item.shoot = ModProjectile.getTypeByName('JewellersWallGripPro');
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.useAnimation = 20;
        this.Item.useTime = 20;
    }

    ModifyTooltipLines() {
        const hookTip = Terraria.Localization.Language.GetText('CommonItemTooltip.Hook').Value;
        this.TooltipLines = [
            hookTip.replace('{InputTrigger_Grapple}', '[ct:13]')
        ];
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ItemID.RubyHook, 1)
            .AddIngredient(ItemID.TopazHook, 1)
            .AddIngredient(ItemID.EmeraldHook, 1)
            .AddIngredient(ItemID.SapphireHook, 1)
            .AddIngredient(ItemID.AmethystHook, 1)
            .AddIngredient(ItemID.DiamondHook, 1)
            .AddTile(TileID.TinkerersWorkbench)
            .Register();
    }
}
