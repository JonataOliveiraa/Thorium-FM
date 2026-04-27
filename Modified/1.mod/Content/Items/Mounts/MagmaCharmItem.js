import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModMount } from './../../../TL/ModMount.js';

export class MagmaCharmItem extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mounts/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.useTime = 20;
        this.Item.useAnimation = 20;
        this.Item.useStyle = Terraria.ID.ItemUseStyleID.Swing;
        this.Item.UseSound = Terraria.ID.SoundID.Item79;
        this.Item.noMelee = true;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 20 ,0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
    
    PostSetupContent() {
        this.Item.mountType = ModMount.getTypeByName('MagmaCharm');
    }
}