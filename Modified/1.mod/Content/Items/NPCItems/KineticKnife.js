import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class KineticKnife extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/NPCItems/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Item.staff[this.Type] = true;
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.damage = 36;
        this.Item.magic = true;
        this.Item.mana = 15;
        this.Item.channel = true;
        this.Item.useTime = 14;
        this.Item.useAnimation = 14;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.knockBack = 4;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.rare = 5;
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
        this.Item.shoot = ModProjectile.getTypeByName('KineticKnifePro');
        this.Item.shootSpeed = 0.1;
    }
    
    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] === 0;
    }
}