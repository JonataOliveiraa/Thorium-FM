import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { LifeShieldPlayer } from '../../../Global/LifeShieldPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';
import { ThoriumAnvil } from '../../../Global/Tiles/ThoriumAnvil.js';

export class ThoriumShield extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 35, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
        this.Item.defense = 3;
        this.lifeShied = 16
    }

    ModifyTooltipLines() {
        this.TooltipLines[0] = ModLocalization.Translate('ItemTooltip.LifeShieldLabel').replace('{0}', this.lifeShied)
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.LifeShieldActive = true
        ThoriumPlayer.LifeShieldMaxExtraLife = this.lifeShied
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 8)
            .AddIngredient(292, 1)
            .AddTile(ThoriumAnvil.Type)
            .Register();
    }
}
