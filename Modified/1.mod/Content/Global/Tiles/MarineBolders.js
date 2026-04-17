import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";
import { TileData } from "../../../TL/Modules/TileData.js";

const NewText = Terraria.Main['void NewText(string newText, Color color)'];

export class MarineBolders extends GlobalTile {
    Type = Terraria.ID.TileID.Tables2;
    Style = [20, 30, 27];
    
    SetStaticDefaults() {
    }

    CanDrop(x, y, type) {
        const tile = new TileData(x, y);
        const frameWidth = 54;
        const currentStyle = Math.floor(tile.frameX / frameWidth);

        if (type === this.Type &&  this.Style.includes(currentStyle)) {
            NewText('quebrado', Color.White)
            return false;
        }
        return true;
    }

    static InjectTexture() {
        const Tables2Tile = Terraria.ID.TileID.Tables2;

        const marineBoldersTileTexture = tl.texture.load("Textures/TextureReplace/Tables2/MarineBolders.png");

        if (marineBoldersTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[Tables2Tile].Value = marineBoldersTileTexture;
        }
    }
}