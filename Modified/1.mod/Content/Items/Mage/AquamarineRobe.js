import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class AquamarineRobe extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.value = Terraria.Item.sellPrice(0, 1, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
    }

    UpdateEquip(item, player) {
        player.statManaMax2 += 40
        player.manaCost -= 0.08
        player.wearsRobe = true
    }

    ModifyTooltipLines() {
        this.TooltipLines[0] = ModLocalization.Translate('ItemTooltip.Robe')
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Robe, 1)
            .AddIngredient(ModItem.getTypeByName('AquamarineGem'), 10)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}