import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Color } from '../../../TL/Modules/Color.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class ThoriumHelmet extends ModItem {
    color = Color.Yellow;

    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item
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
            ModItem.getTypeByName('ThoriumMail'),
            ModItem.getTypeByName('ThoriumGreaves'),
            ModLocalization.getTranslationArmorSetBonus('Thorium')
        );
    }

    UpdateArmorSet(item, player) {
        player.meleeDamage += 0.10;
        player.rangedDamage += 0.10;
        player.magicDamage += 0.10;
        player.summonDamage += 0.10;
    }


    UpdateEquip(item, player) {
        player.meleeCrit += 2;
        player.rangedCrit += 2;
        player.magicCrit += 2;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 10)
            .AddTile(Terraria.ID.TileID.ChlorophyteExtractinator)
            .Register();
    }
}