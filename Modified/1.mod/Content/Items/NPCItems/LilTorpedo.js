import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class LilTorpedo extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        this.ResearchUnlockCount = 99;
        Terraria.ID.AmmoID.Sets.IsSpecialist[this.Type] = true;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 14;
        this.Item.ranged = true;
        this.Item.damage = 5;
        this.Item.maxStack = 9999;
        this.Item.consumable = true;
        this.Item.knockBack = 1.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 0, 3);
        this.Item.rare = 2;
        this.Item.shoot = ModProjectile.getTypeByName('TorpedoPro');
        this.Item.ammo = this.Type;
    }
}