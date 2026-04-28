import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { LifeShieldPlayer } from '../../../Global/LifeShieldPlayer.js';

export class IronShield extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.accessory = true;
        this.Item.defense = 1;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        player.statLifeMax2 += 10;

        LifeShieldPlayer.Active = true
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(22, 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}