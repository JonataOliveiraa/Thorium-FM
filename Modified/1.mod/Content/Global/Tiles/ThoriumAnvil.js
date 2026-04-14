import { GlobalTile } from "../../../TL/GlobalTile.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { Terraria } from "../../../TL/ModImports.js";

export class ThoriumAnvil extends GlobalTile {
    static Type = 87
    static Style = 36
    
    RightClick(player, i, j, type) {
        const tile = new TileData(i, j);

        if(type === ThoriumAnvil.Type) {
            const style = Math.floor(tile.frameX / 36);

            if(style === 12 ) return false
        }

        return true
    }

    static InjectTexture() {
        const Pianos = Terraria.ID.TileID.Pianos
        const NebulaPianoItem = Terraria.ID.ItemID.NebulaPiano

        const PianosTexture = tl.texture.load("Textures/TextureReplace/Pianos.png");
        
        if (PianosTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[Pianos].Value = PianosTexture;
        }
    }
}