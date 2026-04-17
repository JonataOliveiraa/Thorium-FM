import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from "../../../TL/ModImports.js";

export class DepthSatagmites extends GlobalTile {
    Type = Terraria.ID.TileID.Stalactite1x2Echo
    Style = [34, 35]

    static InjectTexture() {
        const Stalactite1x2EchoTile = Terraria.ID.TileID.Stalactite1x2Echo;

        const depthSatagmitesTileTexture = tl.texture.load("Textures/TextureReplace/Stalactite1x2Echo/DepthSatagmites.png");

        if (depthSatagmitesTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[Stalactite1x2EchoTile].Value = depthSatagmitesTileTexture;
        }
    }
}