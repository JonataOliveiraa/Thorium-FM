import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

export class ExampleYoyo extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.Yoyo[this.Type] = true;
        Terraria.ID.ItemID.Sets.GamepadExtraRange[this.Type] = 15;
    }
    
    SetDefaults() {
        this.Item.melee = true;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.channel = true;
        
        this.Item.shoot = ModProjectile.getTypeByName('ExampleYoyoProjectile');
        this.Item.shootSpeed = 15;
        
        // (damage, knockback, crit);
        this.SetWeaponValues(50, 2.5, 8);
        // (useTime, autoReuse);
        this.SetDefaultWeaponStyle(25, true);
        
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
    }
    
    // Here is an example of blacklisting certain modifiers. Remove this section for standard vanilla behavior.
    // In this example, we are blacklisting the ones that reduce damage of a melee weapon.
    // Make sure that your item can even receive these prefixes (check the vanilla wiki on prefixes).
    unwantedPrefixes = [
        Terraria.ID.PrefixID.Terrible,
        Terraria.ID.PrefixID.Dull,
        Terraria.ID.PrefixID.Shameful,
        Terraria.ID.PrefixID.Annoying,
        Terraria.ID.PrefixID.Broken,
        Terraria.ID.PrefixID.Damaged,
        Terraria.ID.PrefixID.Shoddy
    ];
    
    AllowPrefix(pre) {
        if (this.unwantedPrefixes.includes(pre))
            return false;
        return true;
    }
}