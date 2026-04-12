import { Terraria } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';

export class LivingWoodSap extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/LivingWood/' + this.constructor.name;
        this.SummonDamageIncrease = 1;
        this.SummonKnockbackIncrease = 0.5;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
    }
    
    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            if (line.includes('{0}')) {
                this.TooltipLines[i] = line.replace('{0}', this.SummonDamageIncrease).replace('{1}', this.SummonKnockbackIncrease);
            }
        }
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (!vanity) {
            player.minionKB += (this.SummonKnockbackIncrease / player.minionKB);
            player.minionDamage += (this.SummonDamageIncrease / player.minionDamage);
        }
    }
}