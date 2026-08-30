import { ModBuff } from '../../../../TL/ModBuff.js';
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
                    .replace('{0}', String(this.DamageMultiplier * 100))
                    .replace('{1}', String(this.CriticalChanceBonus))
                    .replace('{2}', (this.SheathMaxCooldown / 60).toFixed(2));
            }
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;
        ThoriumPlayer.SheathMaxCooldown = this.SheathMaxCooldown;
        ThoriumPlayer.SheatType = 0;
        ThoriumPlayer.SheatDamageMultiplier = this.DamageMultiplier;
        ThoriumPlayer.SheatCriticalChanceBonus = this.CriticalChanceBonus;

        // A bainha so carrega e so fica pronta com uma arma de corpo a corpo
        // de balanco na mao. Sem essa mesma checagem no segundo bloco, qualquer
        // outro item mantinha o buff aceso pra sempre depois de carregado uma vez.
        const held = player.HeldItem;
        const validWeapon = held && held.melee && held.useStyle === Terraria.ID.ItemUseStyleID.Swing;

        if (ThoriumPlayer.SheathCooldown < ThoriumPlayer.SheathMaxCooldown && validWeapon) {
            ThoriumPlayer.SheathCooldown++;

            if (ThoriumPlayer.SheathCooldown === ThoriumPlayer.SheathMaxCooldown) {
                ThoriumPlayer.ReadySeathEffect(player);
            }
        }

        if (validWeapon && ThoriumPlayer.SheathCooldown >= ThoriumPlayer.SheathMaxCooldown) {
            if (this._sheathBuff === undefined) this._sheathBuff = ModBuff.getTypeByName('SheathBuff') ?? -1;
            if (this._sheathBuff > 0) {
                player['void AddBuff(int type, int time, bool fromNetPvP)'](this._sheathBuff, 2, false);
            }
            player.meleeCrit += ThoriumPlayer.SheatCriticalChanceBonus;
        }
    }
}