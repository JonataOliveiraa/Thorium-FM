import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

export class LightPinkPhaseblade extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.ShootsOnUseRelease[this.Type] = true
    }

    SetDefaults() {
        this.CloneDefaults(198);
        this.Item.shoot = ModProjectile.getTypeByName('LightPinkPhasebladePro')
    }

    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] === 0;
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