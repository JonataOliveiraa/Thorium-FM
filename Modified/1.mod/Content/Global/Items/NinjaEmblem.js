import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class ClericEmblem {
    Type = Terraria.ID.ItemID.CoralLantern;

    static InjectTexture() {
        const CoralLanternItem = Terraria.ID.ItemID.CoralLantern;
        
        const ninjaEmblemTexture = tl.texture.load("Textures/TextureReplace/SpikeLantern/NinjaEmblem.png");

        if (ninjaEmblemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[CoralLanternItem].Value = ninjaEmblemTexture;
        }
    }
}