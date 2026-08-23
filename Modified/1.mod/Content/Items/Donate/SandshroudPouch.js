import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

export class SandshroudPouch extends ModItem {
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
        this.Item.rare = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 18, 0);
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        ThoriumPlayer.accSandshroudPouch = true;
    }
    
    AddRecipes() {
        this.CreateRecipe()
        .AddIngredient(3380, 8)
        .AddIngredient(ModItem.getTypeByName('Cloth'), 6)
        .AddTile(16)
        .Register();
    }
}