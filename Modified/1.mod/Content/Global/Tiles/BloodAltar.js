import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";
import { WorldDB } from "../../../TL/WorldDB.js";

const { Main } = Terraria
const { TileObjectData } = Terraria.ObjectData

export class BloodAltar extends GlobalTile {
    Type = Terraria.ID.TileID.HoneyDispenser;

    SetStaticDefaults() {
        Main.tileDungeon[this.Type] = true

        const GetTileData = TileObjectData['TileObjectData GetTileData(int type, int style, int alternate)'];
        let data = GetTileData(this.Type, 0, 0);
        TileObjectData.readOnlyData = false;
        data.LavaDeath = false;
        TileObjectData.readOnlyData = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        if (type === this.Type) {
            if (!WorldDB.has('Thorium:HasBeenDefeated_Visconde')) return false
        }
        return true
    }

    static InjectTexture() {
        const HoneyDispenserTile = Terraria.ID.TileID.HoneyDispenser;
        const HoneyDispenserItem = Terraria.ID.ItemID.HoneyDispenser;

        const bloodAltarItemTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Item.png");
        const bloodAltarTileTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Tile.png");
        const bloodAltarOutlineTexture = tl.texture.load("Textures/TextureReplace/HoneyDispenser/BloodAltar_Highlight.png")

        if (bloodAltarTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[HoneyDispenserTile].Value = bloodAltarTileTexture;
        }

        if (HoneyDispenserItem != null) {
            Terraria.GameContent.TextureAssets.Item[HoneyDispenserItem].Value = bloodAltarItemTexture;
        }

        if (bloodAltarOutlineTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[HoneyDispenserTile].Value = bloodAltarOutlineTexture
        }
    }
}

//HoneyDispenser