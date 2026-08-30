import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class NaiadShiv extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Thrower/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.ranged = true;
        this.Item.damage = 18;
        this.Item.useTime = 22;
        this.Item.useAnimation = 22;
        this.Item.useStyle = 1;
        this.Item.autoReuse = true;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.knockBack = 4.0;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 75, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item19;
        this.Item.shoot = ModProjectile.getTypeByName('NaiadShivPro');
        this.Item.shootSpeed = 12.0;
    }
}