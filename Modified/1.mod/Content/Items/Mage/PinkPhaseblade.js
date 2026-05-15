import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

export class PinkPhaseblade extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetDefaults() {
        this.CloneDefaults(198);
    }

    HoldItem(item, player) {
        const pos = Vector2.Add(
            player.itemLocation,
            Vector2.new(6 + player.velocity.X, 14)
        );

        const cyan = Color.Pink;
        const r = cyan.R / 255 * 0.45;
        const g = cyan.G / 255 * 0.45;
        const b = cyan.B / 255 * 0.45;

        Effects.AddLight(pos, r, g, b);
    }

    GetAlpha(item, color) {
        return Color.White;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.MeteoriteBar, 15)
            .AddIngredient(ModItem.getTypeByName('OpalGem'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}