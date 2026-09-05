import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModBardItem } from './../../../Common/ModBardItem.js';
import { Empowerments } from '../../Global/Empowerments.js';

export class TuningFork extends ModBardItem {
    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
        this.instrumentStyle = 'Percussion';
        this.inspirationCost = 1;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 30;
        this.Item.damage = 28;
        this.Item.useTime = 14;
        this.Item.useAnimation = 14;
        this.Item.useStyle = 1;
        this.Item.noMelee = true;
        this.Item.noUseGraphic = true;
        this.Item.knockBack = 6.0;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = 3;
        this.Item.UseSound = Terraria.ID.SoundID.Item19;
        this.Item.autoReuse = true;
        this.Item.shoot = ModProjectile.getTypeByName('TuningForkPro');
        this.Item.shootSpeed = 12.0;
    }
    
    UseItem(item, player) {
        super.UseItem(item, player);
        if (player.itemAnimation === player.itemAnimationMax) {
            Empowerments.Apply(player, 'JumpHeight', 2);
        }
        return true;
    }
    
    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName('BronzeAlloyFragments'), 8)
        .AddTile(16)
        .Register();
    }
}
