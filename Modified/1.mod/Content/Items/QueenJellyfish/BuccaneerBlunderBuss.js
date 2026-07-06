import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const { Main } = Terraria;
export class BuccaneerBlunderBuss extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.damage = 10;
        this.Item.knockBack = 4;
        this.Item.crit = 4;
        this.Item.useTime = 38;
        this.Item.useAnimation = 38;
        this.Item.autoReuse = true;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.ranged = true;
        this.Item.shoot = Terraria.ID.ProjectileID.Bullet;
        this.Item.shootSpeed = 5;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item14;
    }

    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Effects.PlaySound(Terraria.ID.SoundID.Item14, player.Center.X, player.Center.Y);
        }
        return true;
    }

    Shoot(item, player, position, velocity, type, damage, knockBack) {
        this.ConsumeAmmo(player);

        const spread = 0.25;
        const speed = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        const baseAngle = Math.atan2(velocity.X, velocity.Y);

        const angles = [
            baseAngle + 0.5 * spread,
            baseAngle - 0.5 * spread,
            baseAngle + 0.25 * spread,
            baseAngle - 0.25 * spread,
            baseAngle
        ];

        const speedMult = Rand.NextFloat() * 0.2 + 0.95;

        for (const angle of angles) {
            const velX = speed * speedMult * Math.sin(angle);
            const velY = speed * speedMult * Math.cos(angle);
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
        }
        return false;
    }

    ConsumeAmmo(player) {
        const ammoType = Terraria.ID.AmmoID.Bullet;
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
}