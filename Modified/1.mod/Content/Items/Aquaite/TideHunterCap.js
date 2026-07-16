import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Color } from '../../../TL/Modules/Color.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class TideHunterCap extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 60, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('TideHunterChestpiece'),
            ModItem.getTypeByName('TideHunterLeggings'),
            ModLocalization.getTranslationArmorSetBonus('TideHunter')
        );
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.setTideHunter = true
    }


    UpdateEquip(item, player) {
        player.rangedCrit += 4;
        player.breath = player.breathMax - 2
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 8)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 6)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}