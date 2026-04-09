import { Terraria, Modules } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

const { Color } = Modules;

export class ExampleFlail extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.ToolTipDamageMultiplier[this.Type] = 2;
    }
    
    SetDefaults() {
        // Hitbox
        this.Item.width = 30;
        this.Item.height = 10;
        
        // Common Properties
        this.Item.melee = true;
        this.Item.noMelee = true;
        this.Item.channel = true;
        this.Item.scale = 1.1;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(32, 6.75, 7);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(45, false);
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noUseGraphic = true;
        
        // Shoot
        this.Item.shoot = ModProjectile.getTypeByName('ExampleFlailProjectile');
        this.Item.shootSpeed = 12;
    }
    
    GetAlpha(item, color) {
        // This code makes the item draw in full brightness when dropped.
        return Color.White;
    }
}