import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from '../../../TL/ModItem.js';
import { Color } from "../../../TL/Modules/Color.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { ThoriumPlayer } from "../../Global/ThoriumPlayer.js";

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class HereticBreaker extends ModHealerItem {
    goldBar = null

    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(12, 6, 4);
        this.SetDefaultWeaponStyle(30, true);

        this.Item.value = Terraria.Item.sellPrice(0, 0, 31, 22);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }

    OnHitNPC(item, player, npc) {
        if(ThoriumPlayer.RadiantCorruptionActive) {
            for (let i = 0; i < 10; i++) {
                const dustIdx = NewDust(
                    npc.position, npc.width, npc.height,
                    27,
                    Rand.Next(-5, 5),
                    Rand.Next(-5, 5),
                    0, Color.White, 1.8
                );
                const dust = Terraria.Main.dust[dustIdx];
                if (dust) dust.noGravity = true;
            }
        }
    }

    AddRecipeGroups() {
        if (this.goldBar) {
            const itemIds = [Terraria.ID.ItemID.GoldBar, Terraria.ID.ItemID.PlatinumBar];
            this.goldBar = this.CreateRecipeGroup(itemIds);
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddRecipeGroup(this.goldBar)
            .AddIngredient(Terraria.ID.ItemID.GoldBar, 8)
            .AddIngredient(ModItem.getTypeByName('PurifiedShards'), 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}