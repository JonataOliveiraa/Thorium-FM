// SharkStorm.js
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const { Main } = Terraria;

export class SharkStorm extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Aquaite/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 7;
        this.Item.knockBack = 1;
        this.Item.crit = 4;
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.useTime = 8;
        this.Item.useAnimation = 8;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.ranged = true;
        this.Item.autoReuse = true;
        this.Item.value = Terraria.Item.sellPrice(0, 5, 0, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item11;
        this.Item.shoot = Terraria.ID.ProjectileID.Bullet; 
        this.Item.shootSpeed = 10;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item11, player.Center.X, player.Center.Y);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (Rand.Next(0, 100) >= 33) {
            this.ConsumeAmmo(player);
        }

        const angle = (Rand.NextFloat() - 0.5) * Math.PI * 5 / 180;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const velX = velocity.X * cos - velocity.Y * sin;
        const velY = velocity.X * sin + velocity.Y * cos;

        NewProjectile(
            player.GetProjectileSource_Item(item),
            position,
            Vector2.new(velX, velY),
            type,
            damage,
            knockBack,
            player.whoAmI,
            0, 0, 0, null
        );
        return false;
    }

    ConsumeAmmo(player) {
        const ammoType = this.Item.useAmmo;
        for (let i = 0; i < 54; i++) {
            const invItem = player.inventory[i];
            if (invItem && invItem.ammo === ammoType && invItem.stack > 0) {
                invItem.stack--;
                if (invItem.stack <= 0) {
                    invItem.active = false;
                    invItem.type = 0;
                }
                break;
            }
        }
    }

    HoldoutOffset(item, player) {
        return { X: -4, Y: 0 };
    }

    AddRecipes() {
        this.CreateRecipe(1)
            .AddIngredient(Terraria.ID.ItemID.IllegalGunParts, 1)
            .AddIngredient(ModItem.getTypeByName('AquaiteBar'), 8)
            .AddIngredient(ModItem.getTypeByName('DepthScales'), 4)
            .AddTile(Terraria.ID.TileID.Anvils)
            .Register();
    }
}