import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export class CoralPolearm extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Coral/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        ThoriumPlayer.SPEARS.add(this.Type);
    }
    
    SetDefaults() {
        this.Item.width = this.Item.height = 48;
        this.Item.melee = true;
        this.Item.damage = 10;
        this.Item.useTime = 28;
        this.Item.useAnimation = 28;
        this.Item.useStyle = 5;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.autoReuse = true;
        this.Item.knockBack = 5.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 24, 75);
        this.Item.rare = 0;
        this.Item.UseSound = Terraria.ID.SoundID.Item1;
        this.Item.shoot = ModProjectile.getTypeByName('CoralPolearmPro');
        this.Item.shootSpeed = 3.5;
    }
    
    CanUseItem(item, player) {
        return player.ownedProjectileCounts[item.shoot] < 1;
    }
    
    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(275, 9)
        .AddTile(16)
        .Register();
    }
}