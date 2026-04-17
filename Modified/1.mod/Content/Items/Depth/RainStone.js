import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class RainStone extends ModItem {
  constructor() {
    super();
    this.Texture = 'Items/Depth/' + this.constructor.name;
  }

   SetDefaults() {
        const item = this.Item;
        item.maxStack = 1;
        item.rare = Terraria.ID.ItemRarityID.Blue; 
        item.useStyle = 4;
        item.UseSound = Terraria.ID.SoundID.Item4; 
    }

    CanUseItem(item, player) {
        return true;
    }

    UseItem(item, player) {
        //...
        return true; 
    }
}