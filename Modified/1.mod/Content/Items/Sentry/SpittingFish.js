import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main, WorldGen } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const InWorld = WorldGen['bool InWorld(int x, int y, int fluff)'];

const FULL_LIQUID = 255;

export class SpittingFish extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Sentry/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.damage = 18;
        this.Item.summon = true;
        this.Item.sentry = true;
        this.Item.mana = 15;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.knockBack = 6;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item78;
        this.Item.shoot = ModProjectile.getTypeByName('SpittingFishPro');
    }

    IsFullLiquidAt(worldX, worldY) {
        const x = Math.floor(worldX / 16);
        const y = Math.floor(worldY / 16);
        if (!InWorld(x, y, 0)) return false;

        const tile = Main.tile.get_Item(x, y);
        return !!tile && tile.liquid >= FULL_LIQUID;
    }

    SummonSpot(player) {
        const mouse = Main.MouseWorld;
        if (this.IsFullLiquidAt(mouse.X, mouse.Y)) return Vector2.new(mouse.X, mouse.Y);

        const center = player.Center;
        if (this.IsFullLiquidAt(center.X, center.Y)) return Vector2.new(center.X, center.Y);

        return null;
    }

    CanUseItem(item, player) {
        return this.SummonSpot(player) !== null;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const spot = this.SummonSpot(player);
        if (spot === null) return false;

        const index = NewProjectile(
            null,
            spot, Vector2.Zero,
            type, damage, knockBack, player.whoAmI,
            spot.X, spot.Y, 0, null
        );

        const sentry = Main.projectile[index];
        if (sentry) {
            sentry.spriteDirection = player.direction;
            sentry.originalDamage = item.damage;
        }

        player.UpdateMaxTurrets();
        return false;
    }
}
