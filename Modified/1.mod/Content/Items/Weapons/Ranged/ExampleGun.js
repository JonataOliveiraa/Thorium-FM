import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

export class ExampleGun extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Ranged/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.ranged = true;
        this.Item.shoot = Terraria.ID.ProjectileID.PurificationPowder;
        this.Item.shootSpeed = 10;
        this.Item.useAmmo = Terraria.ID.AmmoID.Bullet;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(20, 5, 0);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(10, true);
        
        this.Item.value = Terraria.Item.sellPrice(0, 10, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item41;
    }
    
    HoldoutOffset(item, player) {
        return { X: -18, Y: 0 };
    }
}