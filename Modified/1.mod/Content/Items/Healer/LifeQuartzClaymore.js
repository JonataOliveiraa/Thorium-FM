import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

export class LifeQuartzClaymore extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
        this.hitNPC = false
    }

    SetDefaults() {
        this.SetWeaponValues(12, 6, 4);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 31, 22);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    UseItem(item, player) {
        if (player.itemAnimation === player.itemAnimationMax) this.hitNPC = false;
        return true;
    }

    OnHitNPC(item, player) {
        if (this.hitNPC) return;
        this.hitNPC = true;
        ThoriumPlayer.HealHPInHealerClass(player, 1);

        if (Rand.Next(1, 3) === 2) {
            Effects.NewDust(player.Center, 2, 2, Terraria.ID.DustID.LifeCrystal, 1, 1, 155, Color.White, 1);
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