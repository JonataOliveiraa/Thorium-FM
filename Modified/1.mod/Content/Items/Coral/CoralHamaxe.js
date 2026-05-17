import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class CoralHamaxe extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Coral/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;
        this.Item.axe = 11;
        this.Item.hammer = 45
        this.SetWeaponValues(6, 4, 0);
        this.SetDefaultWeaponStyle(26, true);
        this.Item.useTurn = true

        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 25);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.Coral, 7)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}