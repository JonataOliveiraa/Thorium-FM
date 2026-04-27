import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";

export class ArcaneArmorFabricator extends GlobalTile {
    Type = Terraria.ID.TileID.DyeVat;

    SetStaticDefaults() {
        const idx1 = Terraria.Map.MapHelper.tileLookup[this.Type];
        Terraria.Map.MapHelper.colorLookup[idx1] = Color.new(0, 0, 40);
    }

    static InjectTexture() {
        const DyeVatTile = Terraria.ID.TileID.DyeVat;
        const DyeVatItem = Terraria.ID.ItemID.DyeVat;

        const arcaneArmorFabricatorItemTexture = tl.texture.load("Textures/TextureReplace/DyeVat/ArcaneArmorFabricator_Item.png");
        const arcaneArmorFabricatorTileTexture = tl.texture.load("Textures/TextureReplace/DyeVat/ArcaneArmorFabricator_Tile.png");

        if (arcaneArmorFabricatorTileTexture != null) {
            Terraria.Main.tileMergeDirt[DyeVatTile] = true
            Terraria.GameContent.TextureAssets.Tile[DyeVatTile].Value = arcaneArmorFabricatorTileTexture;
        }

        if (arcaneArmorFabricatorItemTexture != null) {
            Terraria.GameContent.TextureAssets.Item[DyeVatItem].Value = arcaneArmorFabricatorItemTexture;
        }
    }
}