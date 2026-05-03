import { GlobalTile } from "../../../TL/GlobalTile.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModLocalization } from "../../../TL/ModLocalization.js";

export class ThoriumAnvil extends GlobalTile {
    static Type = Terraria.ID.TileID.ChlorophyteExtractinator

    RightClick(player, i, j, type) {
        if(ThoriumAnvil.Type === type) return false

        return true
    }

    SetStaticDefaults() {
        // Terraria.Lang._mapLegendCache[Terraria.Map.MapHelper.TileToLookup(Terraria.ID.TileID.ChlorophyteExtractinator, 0)].Value = ModLocalization.Translate('ItemName.ThoriumAnvil')
    }

    static InjectTexture() {
        const ChlorophyteExtractinatorTile = Terraria.ID.TileID.ChlorophyteExtractinator
        const ChlorophyteExtractinatorItem = Terraria.ID.ItemID.ChlorophyteExtractinator

        const ChlorophyteExtractinatorTileTexture = tl.texture.load("Textures/TextureReplace/ChlorophyteExtractinator/ThoriumAnvil_Tile.png");
        const ChlorophyteExtractinatorItemTexture = tl.texture.load("Textures/TextureReplace/ChlorophyteExtractinator/ThoriumAnvil_Item.png");
        
        if (ChlorophyteExtractinatorTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[ChlorophyteExtractinatorTile].Value = ChlorophyteExtractinatorTileTexture;
        }

        if (ChlorophyteExtractinatorItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[ChlorophyteExtractinatorItem].Value = ChlorophyteExtractinatorItemTexture;
        }
    }
}