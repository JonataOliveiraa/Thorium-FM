import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModPlayer } from '../../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

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
                this.TooltipLines[i] = line
                    .replace('{0}', this.DamageMultiplier * 100)
                    .replace('{1}', this.CriticalChanceBonus)
                    .replace('{2}', (ThoriumPlayer.SheathMaxCooldown / 60).toFixed(2));
            }
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        ThoriumPlayer.SheathMaxCooldown = 240;
        ThoriumPlayer.SheatType = 0;
        ThoriumPlayer.SheatDamageMultiplier = 5;
        ThoriumPlayer.SheatCriticalChanceBonus = 100;

        if (ThoriumPlayer.SheathCooldown < ThoriumPlayer.SheathMaxCooldown && player.HeldItem.melee && player.HeldItem.useStyle === Terraria.ID.ItemUseStyleID.Swing) {
            ThoriumPlayer.SheathCooldown++;

            if (ThoriumPlayer.SheathCooldown === ThoriumPlayer.SheathMaxCooldown) {
                ThoriumPlayer.ReadySeathEffect(player);
            }
        }

        if (
            ThoriumPlayer.SheathMaxCooldown !== undefined &&
            ThoriumPlayer.SheatType !== undefined &&
            ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown
        ) {
            player.meleeCrit += ThoriumPlayer.SheatCriticalChanceBonus;
        }
    }
}