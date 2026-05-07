import { Terraria } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { Vector2 } from '../../../../TL/Modules/Vector2.js';
import { LifeShieldPlayer } from '../../../Global/LifeShieldPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class MoltenScale extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Shields/' + this.constructor.name;
    }

    SetDefaults() {
        this.Item.width = 30;
        this.Item.height = 30;
        this.Item.value = Terraria.Item.sellPrice(0, 0, 50, 0);
        this.Item.rare = Terraria.ID.ItemRarityID.Blue;
        this.Item.accessory = true;
        this.Item.defense = 2;
    }

    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line
        }
    }

    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.MoltenScaleEquipped = true

        const radius = player.width / 2;
        const radiusSq = radius * radius;

        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            const npc = Terraria.Main.npc[i];
            if (!npc || !npc.active || npc.friendly) continue;
            let distSq = Vector2.DistanceSquared(npc.Center, player.Center);
            if (distSq < radiusSq) {
                    ThoriumPlayer.MoltenScaleTimeDelay++;
                    if (ThoriumPlayer.MoltenScaleTimeDelay > ThoriumPlayer.MoltenScaleMaxTimeDelay) {
                    npc.AddBuff(Terraria.ID.BuffID.OnFire, 120, false);
                    ThoriumPlayer.MoltenScaleTimeDelay = 0;
                }
            }
        }
    }
}