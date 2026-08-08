import { ModHealerItem } from '../../../Common/ModHealerItem.js';
import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class BloomGuard extends ModHealerItem {
    constructor() {
        super();
        this.Texture = 'Items/Healer/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.GamepadWholeScreenUseRange[this.Type] = true;
        Terraria.ID.ItemID.Sets.LockOnIgnoresCollision[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.noMelee = true;
        this.Item.knockBack = 0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = 3;
        this.Item.shoot = ModProjectile.getTypeByName('ShroomBoosterBulb');
        this.Item.shootSpeed = 0;
        this.Item.mana = 40;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        position = Vector2.new(Main.MouseWorld.X, Main.MouseWorld.Y);
        player.LimitPointToPlayerReachableArea(position);

        if (!this.FindRestingSpot(position)) return false;

        NewProjectile(
            player.GetProjectileSource_Item(item),
            position.X, position.Y + 20,
            0, 0,
            type, damage, knockBack,
            player.whoAmI, 0, 0, 0, null
        );
        return false;
    }

    FindRestingSpot(position) {
        const tileX = Math.floor(position.X / 16);
        const startY = Math.floor(position.Y / 16);
        const maxY = Math.min(startY + 30, Main.maxTilesY - 1);

        for (let y = startY; y < maxY; y++) {
            const tile = Main.tile.get_Item(tileX, y);
            if (tile['bool active()']() && Main.tileSolid[tile.type]) {
                position.X = tileX * 16;
                position.Y = y * 16 - 41;
                return true;
            }
        }
        return false;
    }
}


class a {
    b() {

    }

    static b() {

    }

    c() {
        this.b();
        a.b();
    }
}