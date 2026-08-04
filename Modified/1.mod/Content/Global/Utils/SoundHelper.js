import { Terraria, Modules } from '../../../TL/ModImports.js';

const { Effects } = Modules;
const cache = new Map();

export class SoundHelper {
    static resolve(...names) {
        const key = names.join('|');
        if (cache.has(key)) return cache.get(key);

        let found = null;
        for (const name of names) {
            try {
                const style = Terraria.ID.SoundID[name];
                if (style) {
                    found = style;
                    break;
                }
            } catch (_) { }
        }

        cache.set(key, found);
        return found;
    }

    static play(names, x, y, pitch = 0, volume = 1) {
        const style = Array.isArray(names) ? this.resolve(...names) : this.resolve(names);
        if (!style) return;
        try { Effects.PlaySound(style, x, y, 1, pitch, volume); } catch (_) { }
    }
}
