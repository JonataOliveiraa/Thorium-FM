import { ModHealerItem } from "../../../Common/ModHealerItem.js";
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
        this.Item.useTime = 2;
        this.Item.reuseDelay = 30;
        this.Item.noMelee = true;
        this.Item.rare = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item24;
        this.Item.autoReuse = true;
    }

    UseStyle(item, player) {
        const shake = Math.sin(player.itemAnimation * 0.8) * 0.15;
        player.itemRotation += shake;
        player.itemLocation = Vector2.new(
            player.itemLocation.X,
            player.itemLocation.Y + Math.sin(player.itemAnimation * 0.6) * 2
        );
    }

    ModifyShootStats(item, player, stats) {
        const vel = stats.velocity;
        const angle = (Math.random() - 0.5) * (Math.PI / 6);
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const scale = 1 - Math.random() * 0.3;
        stats.velocity = Vector2.new((vel.X * cos - vel.Y * sin) * scale, (vel.X * sin + vel.Y * cos) * scale);
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('Petal'), 8)
            .AddTile(Terraria.ID.TileID.DyeVat)
            .Register();
    }
}