import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const NOTE_DROP_BONUS = 0.05;
const MOVE_SPEED_BONUS = 0.08;

export class NoblesLeggings extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Nobles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 22;
        this.Item.height = 18;
        this.Item.defense = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 70, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
    }

    UpdateEquip(item, player) {
        ThoriumPlayer.bardResourceDropBoost += NOTE_DROP_BONUS;
        player.moveSpeed += MOVE_SPEED_BONUS;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 12)
            .AddIngredient(Terraria.ID.ItemID.HellstoneBar, 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
