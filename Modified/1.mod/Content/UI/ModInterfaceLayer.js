import { Terraria } from '../../TL/ModImports.js';

const { Main } = Terraria;

const InterfaceScaleType = new NativeClass('Terraria.UI', 'InterfaceScaleType');
const LegacyGameInterfaceLayer = new NativeClass('Terraria.UI', 'LegacyGameInterfaceLayer');

export class ModInterfaceLayer {
    static Layers = [];
    static LayerNames = new Set();
    static _needsSetup = true;

    get Name() {
        return this.constructor.name;
    }

    get ScaleType() {
        return InterfaceScaleType.None;
    }

    constructor() {
        this.Value = this.CreateInstance();
    }

    CreateInstance() {
        const layer = LegacyGameInterfaceLayer.new();
        layer['void .ctor(string name, InterfaceScaleType scaleType)'](this.Name, this.ScaleType);
        return layer;
    }

    SetupLayerList(list) {
        list.Insert(list.Count, this.Value);
    }

    Draw() {

    }

    static register(layer) {
        const instance = new layer();
        ModInterfaceLayer.Layers.push(instance);
        ModInterfaceLayer.LayerNames.add(instance.Name);
    }

    static getByName(name) {
        return ModInterfaceLayer.Layers.find(l => l.Name === name) ?? null;
    }

    static isModLayer(name) {
        return ModInterfaceLayer.LayerNames.has(name);
    }

    static SetupInterfaceLayers() {
        if (!ModInterfaceLayer._needsSetup) return;
        ModInterfaceLayer._needsSetup = false;
        for (const layer of ModInterfaceLayer.Layers) {
            layer.SetupLayerList(Main.instance._gameInterfaceLayers);
        }
    }

    static DrawLayer(name) {
        ModInterfaceLayer.getByName(name)?.Draw();
    }
}
