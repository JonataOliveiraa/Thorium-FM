import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Color } = Modules;

export class SparkingJellyBall extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/QueenJellyfish/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.ToolTipDamageMultiplier[this.Type] = 2;
    }
    
    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 10;
        
        this.Item.melee = true;
        this.Item.noMelee = true;
        this.Item.channel = true;
        this.Item.scale = 1.1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 30, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(42, 5, 10);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(45, false);
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Shoot;
        this.Item.noUseGraphic = true;
        
        // Shoot
        this.Item.shoot = ModProjectile.getTypeByName('SparkingJellyBallPro');
        this.Item.shootSpeed = 12;
    }
    
    GetAlpha(item, color) {
        return Color.White;
    }
}