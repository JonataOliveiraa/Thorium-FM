import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

let _hookType = -1;

export class ZephyrsGrip extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Hook/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 40;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.expert = true;
        this.Item.noUseGraphic = true;
        this.Item.noMelee = true;
        this.Item.shootSpeed = 10;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.useStyle = 5;
        this.Item.useAnimation = 20;
        this.Item.useTime = 20;

        if (_hookType === -1) _hookType = ModProjectile.getTypeByName('ZephyrsGripPro') ?? -2;
        if (_hookType >= 0) this.Item.shoot = _hookType;
    }

    ModifyTooltipLines() {
        const hookTip = Terraria.Localization.Language.GetText('CommonItemTooltip.Hook').Value;
        this.TooltipLines.push(hookTip.replace('{InputTrigger_Grapple}', '[ct:13]'));
    }
}
