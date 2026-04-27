import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class Freeze extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 5;
        this.Item.shoot = ModProjectile.getTypeByName('FreezePro');
        this.Item.shootSpeed = 8;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(10, 3, 10);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(24, true);
        
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }
}