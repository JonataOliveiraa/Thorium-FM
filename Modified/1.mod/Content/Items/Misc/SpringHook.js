import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

export class SpringHook extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Misc/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 40;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 0, 0);
        this.Item.rare = 3;
        this.Item.noUseGraphic = true;
        this.Item.useStyle = 5;
        this.Item.shootSpeed = 12.0;
        this.Item.shoot = ModProjectile.getTypeByName('SpringHookPro');
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.useAnimation = 20;
        this.Item.useTime = 20;
        this.Item.noMelee = true;
    }
    
    ModifyTooltipLines() {
        const hookTip = Terraria.Localization.Language.GetText('CommonItemTooltip.Hook').Value;
        this.TooltipLines = [
            hookTip.replace('{InputTrigger_Grapple}', '[ct:13]')
        ];
    }
}