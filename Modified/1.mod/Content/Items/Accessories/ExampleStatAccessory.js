import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class ExampleStatAccessory extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Accessories/' + this.constructor.name;
        this.ExtraDamagePercent = 10;
        this.ExtraDamageMultiplier = 1 + this.ExtraDamagePercent / 100;
    }
    
    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            if (line.includes('{0}')) {
                this.TooltipLines[i] = line.replace('{0}', this.ExtraDamagePercent);
                break;
            }
        }
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.value = Terraria.Item.sellPrice(0, 5, 0, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Green;
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        
        player.meleeDamage *= this.ExtraDamageMultiplier;
        player.rangedDamage *= this.ExtraDamageMultiplier;
        player.magicDamage *= this.ExtraDamageMultiplier;
    }
    
    CanAccessoryBeEquippedWith(incomingItem, equippedItem, player) {
        // Can't be equipped with "ExampleShield"
        if (equippedItem.type === ModItem.getTypeByName('ExampleShield')) {
            return false;
        }
        
        // Returns true to preserve vanilla behavior
        return true;
    }
}