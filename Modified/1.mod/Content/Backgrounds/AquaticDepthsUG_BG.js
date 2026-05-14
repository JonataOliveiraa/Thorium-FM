import { Terraria } from './../../TL/ModImports.js';
import { ModUndergroundBackground, ModSurfaceBackground } from './../../TL/ModBackgrounds.js';

export class AquaticDepthsUG_BG extends ModUndergroundBackground {
    constructor() {
        super();
    }
    
    FillTextureArray(textureSlots) {
        textureSlots[0] = ModUndergroundBackground.getBackgroundSlot('AquaticDepthsUG0');
        textureSlots[1] = ModUndergroundBackground.getBackgroundSlot('AquaticDepthsUG1');
        textureSlots[2] = ModUndergroundBackground.getBackgroundSlot('AquaticDepthsUG2');
        textureSlots[3] = ModUndergroundBackground.getBackgroundSlot('AquaticDepthsUG3');
    }
}

export class AquaticDepthsSurface_BG extends ModSurfaceBackground {
    constructor() {
        super();
    }
    
    ModifyFarFades() {
        Terraria.Main.instance.DrawBG_ModifyBGFarBackLayerAlpha(this.Slot, null, null);
        Terraria.Main.instance.DrawBG_ModifyBGFarBackLayerAlpha(this.Slot, null, null);
    }
    
    ChooseFarTexture() {
        return ModSurfaceBackground.getBackgroundSlot('AquaticDepthsSurfaceFar');
    }
    
    ChooseMiddleTexture() {
        return ModSurfaceBackground.getBackgroundSlot('AquaticDepthsSurfaceMid');
    }
    
    ChooseCloseTexture() {
        return ModSurfaceBackground.getBackgroundSlot('AquaticDepthsSurfaceClose');
    }
}