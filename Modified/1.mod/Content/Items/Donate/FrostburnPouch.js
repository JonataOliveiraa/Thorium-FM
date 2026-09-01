import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export class FrostburnPouch extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Donate/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ArmorIDs.Waist.Sets.IsABelt[this.Item.waistSlot] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 20;
        this.Item.accessory = true;
        this.Item.rare = 0;
        this.Item.value = Terraria.Item.sellPrice(0,0,15,0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        ThoriumPlayer.frostburnPouch = true;
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(ModItem.getTypeByName('IcyShard'), 8)
        .AddIngredient(ModItem.getTypeByName('Cloth'), 6)
        .AddTile(16)
        .Register();
    }
}