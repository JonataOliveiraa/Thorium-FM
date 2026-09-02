import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class DevourerStaff extends ModItem {
    static DROP_SPEED = 15;

    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 48;
        this.Item.height = 48;
        this.Item.damage = 16;
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 5;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 20, 0);
        this.Item.rare = 1;
        this.Item.UseSound = Terraria.ID.SoundID.Item76;
        this.Item.shoot = ModProjectile.getTypeByName('DevourerStaffPro');
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawn = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);

        const index = NewProjectile(
            null,
            spawn, Vector2.new(0, DevourerStaff.DROP_SPEED),
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) sentry.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.DemoniteBar, 12)
            .AddIngredient(Terraria.ID.ItemID.ShadowScale, 8)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
