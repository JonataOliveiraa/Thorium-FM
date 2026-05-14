import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModTexture } from "../../../TL/ModTexture.js";

const { Main } = Terraria
const { TileObjectData } = Terraria.ObjectData

export class MarkedGrave extends GlobalTile {
    Type = Terraria.ID.TileID.LihzahrdFurnace;

    SetStaticDefaults() {
        Main.tileDungeon[this.Type] = true

        const GetTileData = TileObjectData['TileObjectData GetTileData(int type, int style, int alternate)'];
        let data = GetTileData(this.Type, 0, 0);
        TileObjectData.readOnlyData = false;
        data.LavaDeath = false;
        TileObjectData.readOnlyData = true;
    }

    static InjectTexture() {
        const LihzahrdFurnaceTile = Terraria.ID.TileID.LihzahrdFurnace;

        const MarkedGraveTileTexture = tl.texture.load("Textures/TextureReplace/LihzahrdFurnace/MarkedGrave_Tile.png");
        const MarkedGraveOutlineTexture = tl.texture.load("Textures/TextureReplace/LihzahrdFurnace/MarkedGrave_Highlight.png")
        const MarkedGraveGlow = tl.texture.load("Textures/TextureReplace/LihzahrdFurnace/MarkedGrave_Glow.png")

        if (MarkedGraveTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[LihzahrdFurnaceTile].Value = MarkedGraveTileTexture;
        }

        if (MarkedGraveOutlineTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[LihzahrdFurnaceTile].Value = MarkedGraveOutlineTexture
        }
        
        if(MarkedGraveGlow != null) {
            Terraria.GameContent.TextureAssets.Flames[11] = new ModTexture('Textures/TextureReplace/LihzahrdFurnace/MarkedGrave_Glow').asset.asset
        }
    }
}