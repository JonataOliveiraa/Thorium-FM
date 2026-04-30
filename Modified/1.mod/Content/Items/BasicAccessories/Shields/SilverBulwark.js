import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { LifeShieldPlayer } from '../../../Global/LifeShieldPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class SilverBulwark extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.accessory = true;
        this.Item.defense = 2;
        this.lifeShied = 12
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
            .AddIngredient(21, 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}