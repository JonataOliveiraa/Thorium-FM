import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Rand } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class CoralCrossbow extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Coral/' + this.constructor.name;
    }

    SetDefaults() {
        this.SetWeaponValues(13, 4, 5);
        this.SetDefaultWeaponStyle(40, true);
        this.Item.ranged = true;
        this.Item.shoot = 1;
        this.Item.shootSpeed = 11;
        this.Item.useAmmo = Terraria.ID.AmmoID.Arrow;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 19, 25);
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.UseSound = Terraria.ID.SoundID.Item5;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        player['void ChangeDir(int dir)'](velocity.X >= 0 ? 1 : -1);

        if (!player.HasAmmo(item, false)) return false;

        const projType = this.ConsumeAmmo(player, item.useAmmo);
        if (!projType || projType <= 0) return false;

        const finalType = projType === Terraria.ID.ProjectileID.WoodenArrowFriendly
            ? ModProjectile.getTypeByName('CoralCrossbowPro')
            : projType;

        NewProjectile(
            player.GetProjectileSource_Item(item),
            position,
            Vector2.Multiply(velocity, 1.2),
            finalType,
            damage, knockBack,
            player.whoAmI,
            0, 0, 0, null
        );
        return false;
    }

    PickAmmo(player, ammoId) {
        const inv = player.inventory;
        let obj = null;
        let found = false;
        for (let i = 54; i < 58; i++) {
            obj = inv[i];
            if (obj.ammo === ammoId && obj.stack > 0) { found = true; break; }
        }
        if (!found) {
            for (let j = 0; j < 54; j++) {
                obj = inv[j];
                if (obj.ammo === ammoId && obj.stack > 0) { found = true; break; }
            }
        }
        return found ? obj : null;
    }

    CanConsumeAmmo(player, ammoId) {
        if (player.magicQuiver && (ammoId === Terraria.ID.AmmoID.Arrow || ammoId === Terraria.ID.AmmoID.Stake) && Rand.Next(0, 5) === 0) return false;
        if (player.ammoBox && Rand.Next(0, 5) === 0) return false;
        if (player.ammoPotion && Rand.Next(0, 5) === 0) return false;
        if (player.chloroAmmoCost80 && Rand.Next(0, 5) === 0) return false;
        if (player.ammoCost80 && Rand.Next(0, 5) === 0) return false;
        if (player.ammoCost75 && Rand.Next(0, 4) === 0) return false;
        return true;
    }

    ConsumeAmmo(player, ammoId) {
        const obj = this.PickAmmo(player, ammoId);
        if (!obj) return -1;
        let projToShoot = obj.shoot > 0 ? obj.shoot : -1;
        if (player.hasMoltenQuiver && projToShoot === 1) projToShoot = 2;
        if (projToShoot > 0 && this.CanConsumeAmmo(player, ammoId)) {
            if (obj.consumable) {
                obj.stack--;
                if (obj.stack <= 0) obj['void TurnToAir(bool fullReset)'](true);
            }
        }
        return projToShoot;
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.JungleSpores, 7)
            .AddIngredient(Terraria.ID.ItemID.FallenStar, 1)
            .AddTile(Terraria.ID.TileID.WorkBenches)
            .Register();
    }

    HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }
}