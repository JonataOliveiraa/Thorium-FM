import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Color } from '../../../TL/Modules/Color.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class DepthDiverHelmet extends ModItem {
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
            ModItem.getTypeByName('DepthDiverChestplate'),
            ModItem.getTypeByName('DepthDiverGreaves'),
            ModLocalization.getTranslationArmorSetBonus('DepthDiver')
        );
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.setDepthDiverHelmet = true
        player.moveSpeed += 0.1
        player.breath = player.breathMax - 2
    }


    UpdateEquip(item, player) {
        player.meleeCrit += 6;
        player.rangedCrit += 6;
        player.magicCrit += 6;
        ThoriumPlayer.class.Bard.symphonicCrit += 6;
        ThoriumPlayer.class.Healer.radiantCrit += 6;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}