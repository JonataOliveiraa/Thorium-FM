import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

const { Main, Collision } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CCol = Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)']
export class AquaPelter extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 15;
        this.Item.crit = 6;
        this.Item.ranged = true;
        this.Item.width = 40;
        this.Item.height = 40;
        this.Item.useTime = 10;
        this.Item.useAnimation = 10;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item54;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('AquaPelterPro');
        this.Item.shootSpeed = 15;
    }

    

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item54, player.Center.X, player.Center.Y);
        }
        return true;
    }

    ModifyShootStats(item, player, stats) {
        const norm = Vector2.Normalize(stats.velocity);
        const advance = Vector2.Multiply(norm, 25);
        const testPos = Vector2.Add(stats.position, advance);
        if (CCol(stats.position, 0, 0, testPos, 0, 0)) {
            stats.position = testPos;
        }

        const spread = 0.3;
        const baseSpeed = Math.sqrt(stats.velocity.X * stats.velocity.X + stats.velocity.Y * stats.velocity.Y);
        const baseAngle = Math.atan2(stats.velocity.X, stats.velocity.Y);
        const newAngle = baseAngle + (Rand.NextFloat() - 0.5) * spread;
        const speedMult = 0.95 + Rand.NextFloat() * 0.2;

        const vel = stats.velocity;
        vel.X = baseSpeed * speedMult * Math.sin(newAngle);
        vel.Y = baseSpeed * speedMult * Math.cos(newAngle);
        stats.velocity = vel;
    }

    HoldoutOffset(item, player) {
        return { X: 0, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 14)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 6)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}