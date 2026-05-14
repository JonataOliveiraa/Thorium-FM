import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";

export class LifeQuartzClaymore extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Melee/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.melee = true;

        // (damage, knockback, crit);
        this.SetWeaponValues(12, 6, 4);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 31, 22);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    OnHitNPC(item, player) {
        player.Heal(1)

        if(Rand.Next(1, 3) === 2) {
            Effects.NewDust(player.Center, 2, 2, Terraria.ID.DustID.LifeCrystal, 1, 1, 155, Color.White, 1)
        }
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.LifeCrystal, 1)
            .AddIngredient(ModItem.getTypeByName('LifeQuartzOre'), 10)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}