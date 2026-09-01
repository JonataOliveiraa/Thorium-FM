import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class OpalHook extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Hook/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.noUseGraphic = true;
        this.Item.noMelee = true;
        this.Item.useStyle = 5;
        this.Item.useAnimation = 20;
        this.Item.useTime = 20;
        this.Item.shootSpeed = 10.75;
        this.Item.shoot = ModProjectile.getTypeByName('OpalHookPro');
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    ModifyTooltipLines() {
        const hookTip = Terraria.Localization.Language.GetText('CommonItemTooltip.Hook').Value;
        this.TooltipLines = [
            hookTip.replace('{InputTrigger_Grapple}', '[ct:13]')
        ];
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('OpalGem'), 15)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register()
    }
}
