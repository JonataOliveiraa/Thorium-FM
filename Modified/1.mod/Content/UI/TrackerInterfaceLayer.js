import { ModInterfaceLayer } from './ModInterfaceLayer.js';
import { ModInterface } from './ModInterface.js';
import { VanillaInterfaceLayers } from './VanillaInterfaceLayers.js';

export class TrackerInterfaceLayer extends ModInterfaceLayer {
    constructor() {
        super();
        this.tracker = null;
    }

    SetupLayerList(list) {
        list.Insert(VanillaInterfaceLayers.MouseText, this.Value);
    }

    Draw() {
        if (!this.tracker) this.tracker = ModInterface.getByName('TrackerInterface');
        this.tracker?.Draw();
    }
}
