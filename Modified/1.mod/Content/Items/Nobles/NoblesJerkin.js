import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const SYMPHONIC_BONUS = 0.10;
const NOTE_DROP_BONUS = 0.06;

export class NoblesJerkin extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Nobles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 18;
        this.Item.defense = 7;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 80, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    UpdateEquip(item, player) {
        ThoriumPlayer.class.Bard.multiplier += SYMPHONIC_BONUS;
        ThoriumPlayer.bardResourceDropBoost += NOTE_DROP_BONUS;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 16)
            .AddIngredient(Terraria.ID.ItemID.HellstoneBar, 12)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
