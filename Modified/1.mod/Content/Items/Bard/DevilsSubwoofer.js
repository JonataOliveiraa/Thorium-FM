import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const ARMOR_PENETRATION = 2;
const HELLSTONE_BAR = 175;

export class DevilsSubwoofer extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.accessory = true;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.armorPenetration += ARMOR_PENETRATION;
        player.buffImmune[Terraria.ID.BuffID.OnFire] = true;
        ThoriumPlayer.accSubwooferFire = true;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Subwoofer'), 1)
            .AddIngredient(HELLSTONE_BAR, 12)
            .AddTile(Terraria.ID.TileID.Bookcases)
            .Register();
    }
}
