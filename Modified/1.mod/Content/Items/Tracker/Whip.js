import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class Whip extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Tracker/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 40;
        this.Item.melee = true;
        this.Item.damage = 20;
        this.Item.useTime = 30;
        this.Item.useAnimation = 30;
        this.Item.knockBack = 5.0;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 0, 0);
        this.Item.rare = 2;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('WhipPro');
        this.Item.shootSpeed = 15.0;
    }
    
    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
}