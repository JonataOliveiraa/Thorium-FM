import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const HONEY_BLOCK = 1125;

const EXTRA_LIFE = 20;
const DAMAGE_BONUS = 0.10;
const CRIT_BONUS = 5;

export class CrystalHoney extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 28;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 75, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.statLifeMax2 += EXTRA_LIFE;
        ThoriumPlayer.class.Healer.multiplier += DAMAGE_BONUS;
        ThoriumPlayer.class.Healer.radiantCrit += CRIT_BONUS;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('PurifiedShards'), 10)
            .AddIngredient(ModItem.getTypeByName('LifeGem'), 1)
            .AddIngredient(HONEY_BLOCK, 15)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
