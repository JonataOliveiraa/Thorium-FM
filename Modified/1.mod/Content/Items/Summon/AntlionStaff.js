import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class AntlionStaff extends ModItem {
    static DROP_SPEED = 15;

    constructor() {
        super();
        this.Texture = 'Items/Summon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.damage = 14;
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
        this.Item.rare = 0;
        this.Item.UseSound = Terraria.ID.SoundID.Item76;
        this.Item.shoot = ModProjectile.getTypeByName('AntlionStaffPro');
    }

    HoldoutOffset(item, player) {
        return { X: -8, Y: 0 };
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spawn = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);

        const index = NewProjectile(
            null,
            spawn, Vector2.new(0, AntlionStaff.DROP_SPEED),
            type, damage, knockBack, player.whoAmI, 0, 0, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) sentry.originalDamage = item.damage;

        player.UpdateMaxTurrets();
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.AntlionMandible, 4)
            .AddIngredient(Terraria.ID.ItemID.SandBlock, 20)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }
}
