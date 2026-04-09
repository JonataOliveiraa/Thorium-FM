import { Terraria, Modules } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

const { MathHelper, Rand, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ExampleShotgun extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Ranged/' + this.constructor.name;
    }
    
    SetDefaults() {
        // Common Properties
        this.Item.width = 44; // Hitbox width of the item.
        this.Item.height = 18; // Hitbox height of the item.
        this.Item.rare = Terraria.ID.ItemRarityID.Green; // The color that the item's name will be in-game.
        this.Item.value = Terraria.Item.buyPrice(0, 10, 0, 0);
        
        // Use Properties
        this.Item.useTime = 55; // The item's use time in ticks (60 ticks == 1 second.)
        this.Item.useAnimation = 55; // The length of the item's use animation in ticks (60 ticks == 1 second.)
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot; // How you use the item (swinging, holding out, etc.)
        this.Item.autoReuse = true; // Whether or not you can hold click to automatically use it again.
        this.Item.UseSound = Terraria.ID.SoundID.Item36; // The sound that this item plays when used.
        
        // Weapon Properties
        this.Item.ranged = true; // Sets the damage type to ranged.
        this.Item.damage = 10; // Sets the item's damage. Note that projectiles shot by this weapon will use its and the used ammunition's damage added together.
        this.Item.knockBack = 6; // Sets the item's knockback. Note that projectiles shot by this weapon will use its and the used ammunition's knockback added together.
        this.Item.noMelee = true; // So the item's animation doesn't do damage.
        
        // Gun Properties
        this.Item.shoot = Terraria.ID.ProjectileID.PurificationPowder; // For some reason, all the guns in the vanilla source have this.
        this.Item.shootSpeed = 10; // The speed of the projectile (measured in pixels per frame.)
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet; // The "ammo Id" of the ammo item that this weapon uses. Ammo IDs are magic numbers that usually correspond to the item id of one item that most commonly represent the ammo type.
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        const NumProjectiles = 8;
        
        // Check if the player has ammo
        if (player.HasAmmo(item, false)) {
            player.direction = (position.X + velocity.X) < player.Center.X ? -1 : 1;
            
            // Consumes the ammo and returns the projectile type
            const projToShoot = this.ConsumeAmmo(player, item.useAmmo);
            if (!projToShoot || projToShoot <= 0) return false;
            
            // Shoot multiple projectiles
            for (let i = 0; i < NumProjectiles; i++) {
                let newVelocity = Terraria.Utils.RotatedByRandom(velocity, MathHelper.ToRadians(15));
                newVelocity = Vector2.Multiply(newVelocity, 1 - Rand.NextFloat(0.3));
                NewProjectile(player.GetProjectileSource_Item(item), position, newVelocity, projToShoot, damage, knockBack, player.whoAmI, 0, 0, 0, null);
            }
        }
        
        return false;
    }
    
    HoldoutOffset(item, player) {
        return { X: -2, Y: -2 };
    }
    
    /*
     * The following code is a fix
     * for returning false in Shoot().
     */
    
    PickAmmo(player, ammoId) {
        const inv = player.inventory;
        let obj = null;
        let flag1 = false;
        for (let i = 54; i < 58; i++) {
            obj = inv[i];
            if (obj.ammo === ammoId && obj.stack > 0) {
                flag1 = true;
                break;
            }
        }
        if (!flag1) {
            for (let j = 0; j < 54; j++) {
                obj = inv[j];
                if (obj.ammo === ammoId && obj.stack > 0) {
                    flag1 = true;
                    break;
                }
            }
        }
        return obj;
    }
    
    CanConsumeAmmo(player, ammoId) {
        if (player.magicQuiver && (ammoId === Terraria.ID.AmmoID.Arrow || ammoId === Terraria.ID.AmmoID.Stake) && Rand.NextInt(0, 5) === 0) return false;
        if (player.ammoBox && Rand.NextInt(0, 5) === 0) return false;
        if (player.ammoPotion && Rand.NextInt(0, 5) === 0) return false;
        if (player.chloroAmmoCost80 && Rand.NextInt(0, 5) === 0) return false;
        if (player.ammoCost80 && Rand.NextInt(0, 5) === 0) return false;
        if (player.ammoCost75 && Rand.NextInt(0, 4) === 0) return false;
        return true;
    }
    
    ConsumeAmmo(player, ammoId) {
        const obj = this.PickAmmo(player, ammoId);
        if (!obj) return -1;
        let projToShoot = -1;
        if (ammoId === Terraria.ID.AmmoID.Rocket) projToShoot += obj.shoot;
        else if (ammoId === 780) projToShoot += obj.shoot;
        else if (obj.shoot > 0) projToShoot = obj.shoot;
        if (player.hasMoltenQuiver && projToShoot === 1) projToShoot = 2;
        if (projToShoot > 0 && this.CanConsumeAmmo(player, ammoId)) {
            if (obj !== null && obj.consumable) {
                obj.stack--;
                if (obj.stack <= 0) {
                    obj.TurnToAir(true);
                }
            }
        }
        return projToShoot;
    }
}