import { Terraria, Modules, System } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

const { Dictionary } = System.Collections.Generic;
const { 
    AmmoID,
    ItemID,
    ItemRarityID,
    ProjectileID,
    SoundID
} = Terraria.ID;

export class ExampleRocketLauncher extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Ranged/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        // Creates a `Dictionary<int, int>`
        const dictionary = Dictionary.makeGeneric(System.Int32, System.Int32).new();
        dictionary['void .ctor()']();
        
        // SpecificLauncherAmmoProjectileMatches can be used to provide specific projectiles for specific ammo items.
        // This example dictates that when RocketIII ammo is used, this weapon will fire the Meowmere projectile.
        dictionary.Add(ItemID.RocketIII, ProjectileID.Meowmere);
        
        // Add the dictionary to this item.
        AmmoID.Sets.SpecificLauncherAmmoProjectileMatches.Add(this.Type, dictionary);
    }
    
    SetDefaults() {
        this.Item.ranged = true;
        this.Item.shoot = ProjectileID.RocketI;
        this.Item.shootSpeed = 5;
        this.Item.useAmmo = AmmoID.Rocket;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(55, 4, 0);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(30, true);
        
        this.Item.rare = ItemRarityID.Yellow;
        this.Item.value = Terraria.Item.buyPrice(0, 40, 0, 0);
        this.Item.UseSound = SoundID.Item11;
    }
    
    HoldoutOffset(item, player) {
        return { X: -2, Y: -2 };
    }
}