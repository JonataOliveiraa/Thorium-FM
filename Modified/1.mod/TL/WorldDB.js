import { DatabaseManager } from './Core/DatabaseManager.js';
import { Terraria } from './ModImports.js';
import { FileManager } from './Core/FileManager.js';

export class WorldDB extends DatabaseManager {
    constructor(path) {
        super();
        this.path = path;
        this.data = {};
    }

    static EnsureLoaded() {
        if (this.Instance) return this.Instance;
        const path = Terraria.Main.ActiveWorldFileData?.Path;
        if (!path || !FileManager.IsSafe(path + '.bin')) return null;
        this.Instance = new WorldDB(path + '.bin');
        this.Instance.Load();
        return this.Instance;
    }

    static set(key, value) {
        const instance = this.Instance ?? this.EnsureLoaded();
        if (instance) instance.set(key, value);

        tl.log('nao setado')
        tl.log(`${this.Instance}`)
        tl.log(`${this.Instance?.path}`)
    }

    static get(key) {
        const instance = this.Instance ?? this.EnsureLoaded();
        return instance ? instance.get(key) : null;
    }
    static getAllKeys() {
        const instance = this.Instance ?? this.EnsureLoaded();
        return instance ? instance.getAllKeys() : [];
    }
    static has(key) {
        const instance = this.Instance ?? this.EnsureLoaded();
        return instance ? instance.has(key) : false;
    }
    static delete(key) {
        const instance = this.Instance ?? this.EnsureLoaded();
        if (instance) instance.delete(key);
    }
    static deleteAllKeys() {
        const instance = this.Instance ?? this.EnsureLoaded();
        if (instance) instance.deleteAllKeys();
    }
}