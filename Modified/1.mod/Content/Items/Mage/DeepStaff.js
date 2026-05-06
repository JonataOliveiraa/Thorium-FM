import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

export class DeepStaff extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/Mage/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.magic = true;
        this.Item.mana = 5;
        Terraria.Item.staff[this.Type] = true;
        this.Item.shoot = ModProjectile.getTypeByName('ShadowBolt');
        this.Item.shootSpeed = 12;

        this.SetWeaponValues(18, 3, 10);
        this.SetDefaultWeaponStyle(24, true);

        this.Item.rare = Terraria.ID.ItemRarityID.Green;
        this.Item.value = Terraria.Item.sellPrice(0, 2, 50, 0);
        this.Item.UseSound = Terraria.ID.SoundID.Item43;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UseItem(item, player) {
        if (player.itemAnimation === player.itemAnimationMax) {
            const { DataStructures } = Terraria;
            const deathReason = DataStructures.PlayerDeathReason.ByCustomReason(ModLocalization.Translate('DeathMessage.DeepStaff').replace('{0}', player.name));
            player.Hurt(
                deathReason, // damageSource
                5,           // dano
                0,           // direção
                false,       // pvp
                false,       // quiet
                true,        // Crit
                0,           // cooldownCounter
                false        // dodgeable
            );
        }

        return true;
    }
}