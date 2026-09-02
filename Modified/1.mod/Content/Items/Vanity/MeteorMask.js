import { Terraria } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';

const { ArmorIDs } = Terraria.ID;

export class MeteorMask extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Vanity/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ArmorIDs.Head.Sets.PreventBeardDraw[this.Item.headSlot] = true;
    }

    SetDefaults() {
        this.Item.width = 18;
        this.Item.height = 18;
        this.Item.value = 0;
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.vanity = true;
        this.Item.maxStack = 1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.MeteoriteBar, 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
