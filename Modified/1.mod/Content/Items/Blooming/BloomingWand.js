import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Terraria, Modules } from "./../../../TL/ModImports.js";
import { ModItem } from "./../../../TL/ModItem.js";
import { ModProjectile } from "./../../../TL/ModProjectile.js";

const { Vector2 } = Modules;

export class BloomingWand extends ModHealerItem {
    constructor() {
        super();
        this.Texture = "Items/Blooming/" + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.SetWeaponValues(18, 4, 2);
        this.Item.mana = 10;
        this.Item.shoot = ModProjectile.getTypeByName('BloomingWandPro');
        this.Item.shootSpeed = 10;
        this.Item.useStyle = 5;
        this.Item.useAnimation = 10;
        this.Item.useTime = 10;
        this.Item.reuseDelay = 30;
        this.Item.noMelee = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.autoReuse = true;
    }

    UseStyle(item, player) {
        if (player.itemAnimation === player.itemAnimationMax) Effects.PlaySound(Terraria.ID.SoundID.Item24, player.Center.X, player.Center.Y, 1, 0, 1.5)
        const shake = Math.sin(player.itemAnimation * 0.8) * 0.15;
        player.itemRotation += shake;
        player.itemLocation = Vector2.new(
            player.itemLocation.X,
            player.itemLocation.Y + Math.sin(player.itemAnimation * 0.6) * 2
        );
    }

    ModifyShootStats(item, player, stats) {
        const angle = Math.atan2(stats.velocity.Y, stats.velocity.X);
        stats.position = Vector2.new(
            stats.position.X + Math.cos(angle) * 40,
            stats.position.Y + Math.sin(angle) * 40
        );
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}