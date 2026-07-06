import { ModItem } from "../../../TL/ModItem.js";
import { Terraria, Modules } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";

const { Color, Vector2 } = Modules;

export class QueensGlowstick extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
    }

    static GetGlowColor() {
        const r = 0.8 + (1 - 0.8) * 0.245;
        const g = 0.8 + (1 - 0.8) * 0.245;
        const b = 1.0 + (1 - 1.0) * 0.245;
        return Color.new(r * 255, g * 255, b * 255);
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.Glowsticks[this.Type] = true;
    }

    SetDefaults() {
        this.Item.mana = 10;
        this.Item.width = 24;
        this.Item.height = 24;
        this.Item.useTime = 15;
        this.Item.useAnimation = 15;
        this.Item.holdStyle = 1;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noWet = true;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('QueensGlowstickPro');
        this.Item.shootSpeed = 6;
    }

    GetAlpha(item, color) {
        return Color.new(255, 255, 255, 50);
    }

    HoldStyle(item, player, mountOffset, heldItemFrame) {
        player.itemLocation.X -= player.direction * 10;
        player.itemLocation.Y += 4;
    }

    HoldItem(item, player) {
        const vector2 = player.RotatedRelativePoint(
            Vector2.new(
                player.itemLocation.X + 12 * player.direction + player.velocity.X,
                player.itemLocation.Y - 14 + player.velocity.Y
            ),
            true,
            true
        );
        const glowColor = QueensGlowstick.GetGlowColor();
        const r = glowColor.R / 255;
        const g = glowColor.G / 255;
        const b = glowColor.B / 255;
        Terraria.Lighting['void AddLight(Vector2 position, float r, float g, float b)'](vector2, r, g, b);
    }

    PostUpdate(item) {
        const center = item.Center;
        const glowColor = QueensGlowstick.GetGlowColor();
        const r = glowColor.R / 255;
        const g = glowColor.G / 255;
        const b = glowColor.B / 255;
        Terraria.Lighting['void AddLight(Vector2 position, float r, float g, float b)'](center, r, g, b);
    }
}