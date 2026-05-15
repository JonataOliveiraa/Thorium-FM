import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModLocalization } from "../../../TL/ModLocalization.js";
import { Color } from "../../../TL/Modules/Color.js";

export class ArcaneArmorFabricator extends GlobalTile {
    static Type = Terraria.ID.TileID.DyeVat;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[ArcaneArmorFabricator.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(0, 0, 40);

        Terraria.Lang._mapLegendCache[Terraria.Map.MapHelper.TileToLookup(ArcaneArmorFabricator.Type, 0)].Value = ModLocalization.Translate('ItemName.ArcaneArmorFabricator')
    }

    RightClick(player, i, j, type) {
        if(ArcaneArmorFabricator.Type === type) return false

        return null
    }

    static InjectTexture() {
        const DyeVatTile = Terraria.ID.TileID.DyeVat;
        const DyeVatItem = Terraria.ID.ItemID.DyeVat;

        const arcaneArmorFabricatorItemTexture = tl.texture.load("Textures/TextureReplace/DyeVat/ArcaneArmorFabricator_Item.png");
        const arcaneArmorFabricatorTileTexture = tl.texture.load("Textures/TextureReplace/DyeVat/ArcaneArmorFabricator_Tile.png");
        const arcaneArmorFabricatorHighlightTexture = tl.texture.load("Textures/TextureReplace/DyeVat/ArcaneArmorFabricator_Highlight.png")

        if (arcaneArmorFabricatorTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[DyeVatTile].Value = arcaneArmorFabricatorTileTexture;
        }

        if (arcaneArmorFabricatorItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[DyeVatItem].Value = arcaneArmorFabricatorItemTexture;
        }

        if(arcaneArmorFabricatorHighlightTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[DyeVatTile].Value = arcaneArmorFabricatorHighlightTexture
        }
    }
}