import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';

export class ExampleMeleeWeapon extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.melee = true;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(50, 6, 6);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(20, true);
        
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
}