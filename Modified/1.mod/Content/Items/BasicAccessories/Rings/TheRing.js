import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class TheRing extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Rings/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0,1,0,0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        
        let heldItem = player.inventory[player.selectedItem];
        player.minionDamage += (2.0 / heldItem.damage);
        player.meleeDamage += (2.0 / heldItem.damage);
        player.magicDamage += (2.0 / heldItem.damage);
        player.rangedDamage += (2.0 / heldItem.damage);
        ThoriumPlayer.class.Bard.symphonicDamage += 2;
        ThoriumPlayer.class.Healer.radiantDamage += 2;

        player.armorPenetration += 2;

        player.meleeCrit += 4.0;
        player.rangedCrit += 4.0;
        player.magicCrit += 4.0;
        ThoriumPlayer.class.Bard.symphonicCrit += 4.0;
        ThoriumPlayer.class.Healer.radiantCrit += 4.0;
    }
    
    AddRecipes() {
    this.CreateRecipe(1)
      .AddIngredient(ModItem.getTypeByName('AmberRing'), 1)
      .AddIngredient(ModItem.getTypeByName('AmethystRing'), 1)
      .AddIngredient(ModItem.getTypeByName('AquamarineRing'), 1)
      .AddIngredient(ModItem.getTypeByName('DiamondRing'), 1)
      .AddIngredient(ModItem.getTypeByName('EmeraldRing'), 1)
      .AddIngredient(ModItem.getTypeByName('OpalRing'), 1)
      .AddIngredient(ModItem.getTypeByName('RubyRing'), 1)
      .AddIngredient(ModItem.getTypeByName('SapphireRing'), 1)
      .AddTile(Terraria.ID.TileID.TinkerersWorkbench)
      .Register();
  }
}
