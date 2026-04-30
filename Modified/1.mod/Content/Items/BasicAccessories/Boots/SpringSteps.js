import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';
import { ModPlayer } from '../../../../TL/ModPlayer.js';
import { ThoriumPlayer } from '../../../Global/ThoriumPlayer.js';

export class SpringSteps extends ModItem {
    constructor() {
        super();
        this.Texture = 'Items/BasicAccessories/Boots/' + this.constructor.name;
        this.MoveSpeedBonus = 8;
    }
    
    SetDefaults() {
        this.Item.accessory = true;
        this.Item.rare = Terraria.ID.ItemRarityID.Orange;
        this.Item.value = Terraria.Item.sellPrice(0, 1, 15, 0);
    }
    
    ModifyTooltipLines() {
        for (let i = this.TooltipLines.length - 1; i >= 0; i--) {
            const line = this.TooltipLines[i];
            this.TooltipLines[i] = line;
        }
    }
    
    UpdateAccessory(item, player, vanity, hideVisual) {
        if (vanity) return;

        ThoriumPlayer.SpringStepsEquipped = true;
        
        player.extraFall += 10;
        player.autoJump = true;

        // Bônus de velocidade de corrida
        player.moveSpeed += this.MoveSpeedBonus / 100;
        player.accRunSpeed = 6.75;
        player.rocketBoots = 0;
        player.vanityRocketBoots = 5;

        if (!hideVisual) {
            player.CancelAllBootRunVisualEffects();
            player.hellfireTreads = true;
            if (!player.mount.Active || player.mount.Type != Terraria.ID.MountID.WallOfFleshGoat) {
                player.DoBootsEffect_PlaceFlamesOnTile(player.Center.X, player.position.Y + player.height);
            }
        }

        // Bônus de altura dos pulos
        if (ThoriumPlayer.jumps === 0) {
            player.jumpSpeedBoost += 5.5;
        }
        if (ThoriumPlayer.jumps === 1) {
            player.jumpSpeedBoost += 1.25;
        }
        if (ThoriumPlayer.jumps === 2) {
            player.jumpSpeedBoost += 2.75;
            if (!hideVisual && player.velocity.Y !== 0) {
                player.DoBootsEffect_PlaceFlamesOnTile(player.Center.X, player.position.Y + player.height);
            }
        }
    }
}