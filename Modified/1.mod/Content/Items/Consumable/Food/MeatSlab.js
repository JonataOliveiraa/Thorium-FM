import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModItem } from '../../../../TL/ModItem.js';

const { ItemID } = Terraria.ID;

export class MeatSlab extends ModItem {
    ResearchUnlockCount = 0;
    
    constructor() {
        super();
        this.Texture = 'Items/Consumable/Food/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ItemID.Sets.IsAPickup[this.Type] = true;
        ItemID.Sets.ItemsThatShouldNotBeInInventory[this.Type] = true;
        ItemID.Sets.IgnoresEncumberingStone[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = this.Item.height = 14;
    }
    
    CanPickup(item, player) {
        return true;
    }
    
    OnPickup(item, player) {
        Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'
        ](Terraria.ID.SoundID.Item2, player.position, 0, 1);
        player.AddBuff(26, 1800, false);
        item.TurnToAir(true);
    }
}
