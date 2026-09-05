import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const HEAL_BONUS = 1;

export class Equalizer extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 20;
        this.Item.height = 20;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 20, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.LightRed;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.class.Healer.healPowerExtraValue += HEAL_BONUS;
        ThoriumPlayer.equilibrium = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('PacifistNecklace'), 1)
            .AddIngredient(ModItem.getTypeByName('HoneyHeart'), 1)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
