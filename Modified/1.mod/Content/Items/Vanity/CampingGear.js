import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const STILL_THRESHOLD = 0.005;

export class CampingGear extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 28;
        this.Item.height = 32;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 25, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        const vel = player.velocity;
        if (Math.abs(vel.X) > STILL_THRESHOLD || Math.abs(vel.Y) > STILL_THRESHOLD) return;
        player.lifeRegen += 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Leather, 6)
            .AddIngredient(ModItem.getTypeByName('Cloth'), 10)
            .AddTile(Terraria.ID.TileID.Loom)
            .Register();
    }
}
