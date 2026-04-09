import { ModPlayer } from '../../../TL/ModPlayer.js';
import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';

export class LivingWoodHelmet extends ModItem {
    constructor() {
    	super();
        this.Texture = 'Items/Armor/' + this.constructor.name;
    }
    
    SetDefaults() {
        this.Item.defense = 1;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
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
        ModPlayer.getByName('gPlayer').LivingWoodAcornArmorBuff = true
    }

    UpdateEquip(item, player) {
        player.minionKB += 1
    }
}