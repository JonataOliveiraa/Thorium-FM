import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModPlayer } from '../../../../TL/ModPlayer.js';
import { SheathPlayer } from '../../../Global/SheathPlayer.js'

export class LeatherSheath extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Sheathes/' + this.constructor.name;
    }

    DamageMultiplier = 5
    CriticalChanceBonus = 100
    SheathMaxCooldown = 240;

    SetDefaults() {
        this.Item.width = 26;
        this.Item.height = 28;
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.White;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 5, 0);
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            if (line.includes('{0}') || line.includes('{1}')) {
                this.TooltipLines[i] = line.replace('{0}', this.DamageMultiplier * 100).replace('{1}', this.CriticalChanceBonus).replace('{2}', parseFloat(this.SheathMaxCooldown / 60).toFixed(2));
            }
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        SheathPlayer.SheathMaxCooldown = 240;
        SheathPlayer.SheatType = 0;
        SheathPlayer.SheatDamageMultiplier = 5;
        SheathPlayer.SheatCriticalChanceBonus = 100;

        if (SheathPlayer.SheathCooldown < SheathPlayer.SheathMaxCooldown && player.HeldItem.melee && player.HeldItem.useStyle === Terraria.ID.ItemUseStyleID.Swing) {
            SheathPlayer.SheathCooldown++;

            if (SheathPlayer.SheathCooldown === SheathPlayer.SheathMaxCooldown) {
                SheathPlayer.ReadySeathEffect(player);
            }
        }

        if (
            SheathPlayer.SheathMaxCooldown !== undefined &&
            SheathPlayer.SheatType !== undefined &&
            SheathPlayer.SheathCooldown >= SheathPlayer.SheathMaxCooldown
        ) {
            player.meleeCrit += SheathPlayer.SheatCriticalChanceBonus;
        }
    }
}