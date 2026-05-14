import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class BardEmblem {
    Type = Terraria.ID.ItemID.SpiderLantern;

    static InjectTexture() {
        const SpiderLanternItem = Terraria.ID.ItemID.SpiderLantern;
        
        const bardEmblemTexture = tl.texture.load("Textures/TextureReplace/SpiderLantern/BardEmblem.png");

        if (bardEmblemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[SpiderLanternItem].Value = bardEmblemTexture;
        }
    }
}