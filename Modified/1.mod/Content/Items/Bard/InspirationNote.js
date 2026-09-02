import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Color } = Modules;
const { ItemID } = Terraria.ID;

const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const ALPHA = 0.85;

export class InspirationNote extends ModItem {
    ResearchUnlockCount = 0;
    InspirationRestored = 2;

    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SetStaticDefaults() {
        ItemID.Sets.IsAPickup[this.Type] = true;
        ItemID.Sets.ItemsThatShouldNotBeInInventory[this.Type] = true;
        ItemID.Sets.IgnoresEncumberingStone[this.Type] = true;
    }

    SetDefaults() {
        this.Item.width = 14;
        this.Item.height = 14;
        this.Item.maxStack = 1;
    }

    GetAlpha(item, color) {
        return Color.Multiply(Color.White, ALPHA);
    }

    CanPickup(item, player) {
        return true;
    }

    OnPickup(item, player) {
        PlaySound(Terraria.ID.SoundID.NPCDeath7, player.Center, 0, 1);
        ThoriumPlayer.AddInspirationToPlayer(player, this.InspirationRestored);
        this.SafeOnPickup(player);
        item.TurnToAir(true);
    }

    SafeOnPickup(player) {
    }
}
