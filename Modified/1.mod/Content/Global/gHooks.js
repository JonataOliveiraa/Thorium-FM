import { Terraria } from './../../TL/ModImports.js';
import { GlobalHooks } from './../../TL/GlobalHooks.js';
import { ModBridge } from '../../Common/Snippets/ModBridge.js';
import { ItemLoader } from '../../TL/Loaders/ItemLoader.js';
import { Profiler } from '../../Profiler.js';

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

            try { tl.file.write(Profiler.LOG_FILE, JSON.stringify({ logs: [] }, null, 2)); } catch (_) {}
        });
    }
}