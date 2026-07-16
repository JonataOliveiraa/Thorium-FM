import { ModItem } from "../../../TL/ModItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Rand } from "../../../TL/Modules/Rand.js";

const { Main } = Terraria;

export class DrenchedDirk extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 18;
        this.Item.melee = true;
        this.Item.width = 34;
        this.Item.height = 34;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = 3;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('DrenchedPro');
        this.Item.shootSpeed = 13;
    }

    ModifyShootStats(item, player, stats) {
        const spread = 0.6;
        const baseSpeed = Math.sqrt(stats.velocity.X * stats.velocity.X + stats.velocity.Y * stats.velocity.Y);
        const baseAngle = Math.atan2(stats.velocity.X, stats.velocity.Y);
        const newAngle = baseAngle + (Rand.NextFloat() - 0.5) * spread;
        const speedMult = 0.95 + Rand.NextFloat() * 0.2;

        const vel = stats.velocity
        vel.X = baseSpeed * speedMult * Math.sin(newAngle);
        vel.Y = baseSpeed * speedMult * Math.cos(newAngle);

        stats.velocity = vel 
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 10)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 6)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}