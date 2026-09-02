import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const TILE_SIZE = 16;
const TILE_CENTER = 8;

export class CreepingVineStaff extends ModItem {
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
        this.Item.damage = 15;
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.knockBack = 3;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 54, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shoot = ModProjectile.getTypeByName('CreepingVineStaffPro');
    }

    AnchorTile() {
        const tileX = Math.floor(Main.MouseWorld.X / 16);
        const tileY = Math.floor(Main.MouseWorld.Y / 16);
        const tile = Main.tile.get_Item(tileX, tileY);

        if (!tile || !tile['bool active()']() || !Main.tileSolid[tile.type]) return null;

        return Vector2.new(tileX * TILE_SIZE + TILE_CENTER, tileY * TILE_SIZE + TILE_CENTER);
    }

    CanUseItem(item, player) {
        return this.AnchorTile() !== null;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const anchor = this.AnchorTile();
        if (anchor === null) return false;

        player.direction = Main.MouseWorld.X > player.Center.X ? 1 : -1;

        const index = NewProjectile(
            null,
            anchor, Vector2.Zero,
            type, damage, knockBack, player.whoAmI, anchor.X, anchor.Y, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) {
            sentry.spriteDirection = player.direction;
            sentry.originalDamage = item.damage;
        }

        player.UpdateMaxTurrets();
        return false;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 12)
            .AddIngredient(Terraria.ID.ItemID.Stinger, 4)
            .AddIngredient(Terraria.ID.ItemID.Vine, 2)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}
