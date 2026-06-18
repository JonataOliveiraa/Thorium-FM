import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class CriersCap extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Criers/' + this.constructor.name;
        this.regenBonus = 0.04;
    }

    SetDefaults() {
        this.Item.defense = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('CriersSash'),
            ModItem.getTypeByName('CriersLeggings'),
            ModLocalization.getTranslationArmorSetBonus('Criers')
        );
    }

    UpdateEquip(item, player) {
        ThoriumPlayer.class.Bard.inspirationRegenBonus += this.regenBonus;
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.class.Bard.bardBuffDurationFlat += 180;
    }

    ModifyTooltipLines() {
        const displayValue = Math.round(this.regenBonus * 100).toString();
        this.TooltipLines[0] = ModLocalization.Translate(`ItemTooltip.InpirationRegenBonus`).replace('{0}', displayValue);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName("Cloth"), 8)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}