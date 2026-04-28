import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { ThoriumAnvil } from "../../Global/Tiles/ThoriumAnvil.js"
export class ThoriumBlade extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thorium/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;

        this.SetWeaponValues(18, 6, 4);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(18, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 22, 22);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('ThoriumBar'), 8)
            .AddTile(ThoriumAnvil.Type)
            .Register();
    }
}