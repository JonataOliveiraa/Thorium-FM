import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Main } = Terraria;

const BUFF_TIME = 3600;

export class SimpleBroom extends ModItem {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 34;
        this.Item.height = 36;
        this.Item.damage = 0;
        this.Item.noMelee = true;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.HoldUp;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.UseSound = Terraria.ID.SoundID.Item2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 10, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.buffType = ModBuff.getTypeByName('MaidBuff');
    }

    UseItem(item, player) {
        this.ClearMaids(player);
        player.AddBuff(item.buffType, BUFF_TIME, false);
        return true;
    }

    ClearMaids(player) {
        const first = ModProjectile.getTypeByName('Maid1');
        const second = ModProjectile.getTypeByName('Maid2');

        for (let i = 0; i < Main.maxProjectiles; i++) {
            const proj = Main.projectile[i];
            if (!proj || !proj.active) continue;
            if (proj.owner !== player.whoAmI) continue;
            if (proj.type === first || proj.type === second) proj.Kill();
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddRecipeGroup('Wood')
            .AddIngredient(Terraria.ID.ItemID.Wood, 10)
            .AddIngredient(Terraria.ID.ItemID.Hay, 15)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
