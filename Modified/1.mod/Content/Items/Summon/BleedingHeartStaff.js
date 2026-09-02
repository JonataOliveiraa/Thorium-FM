import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BleedingHeartStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = 40;
        this.Item.height = 48;

        this.Item.damage = 14;
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.useTime = 40;
        this.Item.useAnimation = 40;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 2;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item34;
        this.Item.shoot = ModProjectile.getTypeByName('BleedingHeartStaffPro');
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawn = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);

        const index = NewProjectile(
            null,
            spawn, Vector2.Zero,
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) sentry.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.CrimtaneBar, 12)
            .AddIngredient(Terraria.ID.ItemID.TissueSample, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
