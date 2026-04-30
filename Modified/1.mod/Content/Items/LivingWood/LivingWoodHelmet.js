import { ModPlayer } from '../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class LivingWoodHelmet extends ModItem {
    constructor() {
    	super();
        this.Texture = 'Items/LivingWood/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.defense = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 2, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.White;    
    }
    
    AddArmorSets() {
        this.CreateArmorSet(
            this.Type,
            ModItem.getTypeByName('LivingWoodChestguard'),
            ModItem.getTypeByName('LivingWoodLeggings'),
            ModLocalization.getTranslationArmorSetBonus('LivingWood')
        );
    }
    
    UpdateArmorSet(item, player) {
        ThoriumPlayer.LivingWoodAcornArmorBuff = true
    }

    UpdateEquip(item, player) {
        player.minionKB += 1
    }

    AddRecipes() {
        this.CreateRecipe(1)
        .AddIngredient(ModItem.getTypeByName("LivingLeaf"), 6)
        .AddIngredient(Terraria.ID.ItemID.Wood, 10)
        .AddTile(Terraria.ID.TileID.WorkBenches)
        .Register();
    }
}