import { Terraria } from './../../../../TL/ModImports.js';
import { ModItem } from './../../../../TL/ModItem.js';
import { ModProjectile } from './../../../../TL/ModProjectile.js';

export class ExampleWhip extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Weapons/Melee/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        const tagEffect = Terraria.GameContent.Items.WhipTagEffect.new();
        tagEffect['void .ctor()']();
        
        tagEffect.TagDamage = 10;
        tagEffect.CritChance = 5;
        
        tagEffect.PlayerBuffId = 312; // This is the Ice Whip buff
        tagEffect.PlayerBuffTime = 240; // 4 seconds is the time used by most whips
        
        Terraria.ID.ItemID.Sets.UniqueTagEffects[this.Type] = tagEffect;
    }
    
    SetDefaults() {
        this.DefaultToWhip(ModProjectile.getTypeByName('ExampleWhipProjectile'), 20, 2, 4);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.channel = true;
    }
}