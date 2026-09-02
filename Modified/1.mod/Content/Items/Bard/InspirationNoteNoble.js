import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { InspirationNote } from './InspirationNote.js';

const AUDIO_OVERLOAD_TIME = 300;

let _audioOverloadType = -1;

export class InspirationNoteNoble extends InspirationNote {
    InspirationRestored = 4;

    constructor() {
        super();
        this.Texture = 'Items/Bard/' + this.constructor.name;
    }

    SafeOnPickup(player) {
        if (_audioOverloadType === -1) _audioOverloadType = ModBuff.getTypeByName('AudioOverloadBuff') ?? -2;
        if (_audioOverloadType < 0) return;
        player.AddBuff(_audioOverloadType, AUDIO_OVERLOAD_TIME, false);
    }
}
