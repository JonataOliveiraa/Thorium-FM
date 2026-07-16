import { ModBardItem } from "../../../Common/ModBardItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Empowerments } from "../../Global/Empowerments.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ScubaCurva extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
        this.instrumentStyle = 'Brass';
    }

    SetDefaults() {
        this.Item.damage = 17;
        this.Item.knockBack = 0;
        this.Item.crit = 4;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.scale = 1;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = 5;
        this.Item.holdStyle = 3;
        this.Item.autoReuse = true;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('ScubaCurvaPro');
        this.Item.shootSpeed = 0;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item66, player.Center.X, player.Center.Y);
            Empowerments.Apply(player, "FlatDamage", 1);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawnPos = Vector2.new(
            player.Center.X,
            player.Center.Y - 2
        );

        const projVel = Vector2.new(
            5.35 * player.direction,
            0
        );

        NewProjectile(
            player.GetProjectileSource_Item(item),
            spawnPos,
            projVel,
            type,
            damage,
            knockBack,
            player.whoAmI,
            0, 0, 0, null
        );

        return false;
    }

    HoldoutOffset(item, player) {
        return { X: -6, Y: -3 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 10)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 6)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}