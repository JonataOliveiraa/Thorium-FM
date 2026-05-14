import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Color } from '../../../TL/Modules/Color.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class YewWoodHelmet extends ModItem {
    color = Color.Yellow;

    constructor() {
        super();
        this.Texture = 'Items/YewWood/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.defense = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 40, 0);
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
            ModItem.getTypeByName('YewWoodBreastguard'),
            ModItem.getTypeByName('YewWoodLeggings'),
            ModLocalization.getTranslationArmorSetBonus('YewWood')
        );
    }

    UpdateArmorSet(item, player) {
        ThoriumPlayer.YewWoodSetBonus = true
    }


    UpdateEquip(player) {
        ThoriumPlayer.YewWoodAccumulated++
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('YewWood'), 30)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}