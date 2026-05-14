import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { Color } from "../../../TL/Modules/Color.js";
import { TileData } from "../../../TL/Modules/TileData.js";
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
        const targetType = Terraria.ID.TileID.HoneyDispenser;

        for (let scanX = i - 1; scanX <= i + 1; scanX++) {
            for (let scanY = j - 3; scanY <= j; scanY++) {

                const tile = new TileData(scanX, scanY);

                if (tile.type !== targetType) continue;

                let left = scanX - Math.floor(tile.frameX / 18);
                let top = scanY - Math.floor(tile.frameY / 18);

                const bottom1 = new TileData(left, top + 3);
                const bottom2 = new TileData(left + 1, top + 3);
                const bottom3 = new TileData(left + 2, top + 3);

                const supportBroken = !bottom1.isSolid || !bottom2.isSolid || !bottom3.isSolid;

                const breakingSupport = (j === top + 3) && (i >= left && i <= left + 2);

                const breakingAltar = (j >= top && j <= top + 2) && (i >= left && i <= left + 2);

                if (supportBroken || breakingSupport || breakingAltar) {
                    if (!WorldDB.has('Thorium:HasBeenDefeated_Visconde')) {
                        return false;
                    }
                }
            }
        }

        return true;
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