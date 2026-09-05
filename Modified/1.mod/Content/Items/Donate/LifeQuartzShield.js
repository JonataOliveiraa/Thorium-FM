import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const LIFE_REGEN_TIME = 5;

const HEART_LANTERN = 178;
const CAMPFIRE = 177;
const BOTTLED_HONEY = 181;

export class LifeQuartzShield extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 75, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.lifeRegenTime += LIFE_REGEN_TIME;
        ThoriumPlayer.accLifeQuartzShield = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.SilverBar, 8)
            .AddRecipeGroup('SilverBar')
            .AddIngredient(ModItem.getTypeByName('LifeQuartzOre'), 6)
            .AddIngredient(HEART_LANTERN, 1)
            .AddIngredient(CAMPFIRE, 1)
            .AddIngredient(BOTTLED_HONEY, 1)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
