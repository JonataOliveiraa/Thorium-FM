import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class ClericEmblem {
    Type = Terraria.ID.ItemID.SpikeLantern;

    static InjectTexture() {
        const SpikeLanternItem = Terraria.ID.ItemID.SpikeLantern;
        
        const clericEmblemTexture = tl.texture.load("Textures/TextureReplace/SpikeLantern/ClericEmblem.png");

        if (clericEmblemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[SpikeLanternItem].Value = clericEmblemTexture;
        }
    }
}