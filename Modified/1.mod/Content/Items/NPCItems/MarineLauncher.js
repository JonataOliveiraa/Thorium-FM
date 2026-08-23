import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class MarineLauncher extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = 58;
        this.Item.height = 38;
        this.Item.ranged = true;
        this.Item.damage = 20;
        this.Item.useTime = 26;
        this.Item.useAnimation = 26;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 30, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item11;
        this.Item.shoot = ModProjectile.getTypeByName('TorpedoPro');
        this.Item.shootSpeed = 12.0;
        this.Item.useAmmo = ModItem.getTypeByName('LilTorpedo');
    }
    
    HoldoutOffset() {
        return { X: -4, Y: 0 };
    }
}