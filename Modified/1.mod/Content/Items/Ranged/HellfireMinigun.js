import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

const { MathHelper, Rand, Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];
const PlaySound2 = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(int type, int x, int y, int Style, float volumeScale, float pitchOffset)'];

export class HellfireMinigun extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Ranged/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.ranged = true;
        this.Item.damage = 7;
        this.Item.useTime = 7;
        this.Item.useAnimation = 7;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 1.0;
        this.Item.value = Terraria.Item.sellPrice(0, 7, 0, 0);
        this.Item.rare = 3;
        this.Item.autoReuse = true;
        this.Item.shoot = 14;
        this.Item.shootSpeed = 8.0;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
    }
    
    HoldoutOffset() {
        return { X: -4, Y: 0 };
    }
    
    Shoot(item, player, position, velocity, type, damage, knockBack) {
        if (ThoriumPlayer.hellfireEnergyOverload) {
            PlaySound2(Terraria.ID.SoundID.MenuTick, player.position.X, player.position.Y, 1, 1, 0);
            player.direction = (position.X + velocity.X) < player.Center.X ? -1 : 1;
            return false;
        } else {
            ThoriumPlayer.hellfireEnergy++;
        }
        
        // Check if the player has ammo
        if (player.HasAmmo(item, false)) {
            player.direction = (position.X + velocity.X) < player.Center.X ? -1 : 1;
            
            // Consumes the ammo and returns the projectile type
            const projToShoot = this.ConsumeAmmo(player, item.useAmmo);
            if (!projToShoot || projToShoot <= 0) return false;
            
            // Shoot the projectile
            const vector2 = Vector2.Multiply(Vector2.Normalize(velocity), 25.0);
            if (CanHit(position, 0, 0, Vector2.Add(position, vector2), 0, 0)) {
                position = Vector2.Add(position, vector2);
            }
            for (let i = 0; i < 5; i++) {
                const idx = Terraria.Dust.NewDust(Vector2.Add(position, vector2), 4, 4, 174, velocity.X * 0.25 + Rand.NextFloat(0.0, 0.25), velocity.Y * 0.25 + Rand.NextFloat(0.0, 0.25), 125, null, 1.0);
                Terraria.Main.dust[idx].noGravity = true;
            }
            velocity = Terraria.Utils.RotatedByRandom(velocity, MathHelper.ToRadians(5));
            NewProjectile(player.GetProjectileSource_Item(item), position, velocity, projToShoot, damage, knockBack, player.whoAmI, 0, 0, 0, null);
            PlaySound(Terraria.ID.SoundID.Item40, player.position, 0, 1);
        }
        
        return false;
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(98)
        .AddIngredient(324)
        .AddIngredient(175, 15)
        .AddTile(16)
        .Register();
    }
    
    // Fix: return false no Shoot()
    
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
        return flag1 ? obj : null;
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
