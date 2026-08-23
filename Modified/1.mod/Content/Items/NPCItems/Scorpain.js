import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class Scorpain extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ItemID.Sets.Yoyo[this.Type] = true;
    }
    
    SetDefaults() {
        this.CloneDefaults(3278);
        this.Item.shoot = ModProjectile.getTypeByName('ScorpainPro');
        this.Item.rare = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 17, 0);
        this.Item.damage = 13;
        this.Item.knockBack = 4.0;
    }
}