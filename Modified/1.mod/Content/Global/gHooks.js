import { Terraria } from './../../TL/ModImports.js';
import { GlobalHooks } from './../../TL/GlobalHooks.js';
import { ModBridge } from '../../Common/Snippets/ModBridge.js';
import { ItemLoader } from '../../TL/Loaders/ItemLoader.js';
import { ModBardItem } from '../../Common/ModBardItem.js';
import { ThoriumPlayer } from './ThoriumPlayer.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Main } = Terraria
let _cachedBardItem = null;
let _cachedHeldType = -1;

export class gHooks extends GlobalHooks {
    static musicPackIsActive;

    constructor() {
        super();
    }

    Initialize() {
        Terraria.Main['void PostContentLoadInitialize()'].hook((original, self) => {
            original(self);
            gHooks.musicPackIsActive = ModBridge.isActive('potato-music-pack');
            tl.log(`[gHooks] Music pack is active: ${gHooks.musicPackIsActive ? 'Yes' : 'No'}`);
        });
    }
}