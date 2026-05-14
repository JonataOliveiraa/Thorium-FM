import { GlobalTile } from "../../../TL/GlobalTile.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ModTexture } from "../../../TL/ModTexture.js";
import { Color } from "../../../TL/Modules/Color.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { WorldDB } from "../../../TL/WorldDB.js";

const { Main } = Terraria
const { TileObjectData } = Terraria.ObjectData

export class AncientPhylactery extends GlobalTile {
    Type = Terraria.ID.TileID.BoneWelder;

    SetStaticDefaults() {
        Main.tileDungeon[this.Type] = true

        const GetTileData = TileObjectData['TileObjectData GetTileData(int type, int style, int alternate)'];
        let data = GetTileData(this.Type, 0, 0);
        TileObjectData.readOnlyData = false;
        data.LavaDeath = false;
        TileObjectData.readOnlyData = true;
    }

    CanKillTile(i, j, type, blockDamaged) {
        const targetType = Terraria.ID.TileID.BoneWelder;

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
                    if (!WorldDB.has('Thorium:HasBeenDefeated_Lich')) {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    static InjectTexture() {
        const BoneWelderTile = Terraria.ID.TileID.BoneWelder;
        const BoneWelderItem = Terraria.ID.ItemID.BoneWelder;

        const AncientPhylacteryItemTexture = tl.texture.load("Textures/TextureReplace/BoneWelder/AncientPhylactery_Item.png");
        const AncientPhylacteryTileTexture = tl.texture.load("Textures/TextureReplace/BoneWelder/AncientPhylactery_Tile.png");
        const AncientPhylacteryOutlineTexture = tl.texture.load("Textures/TextureReplace/BoneWelder/AncientPhylactery_Highlight.png")
        const AncientPhylacteryGlow = tl.texture.load("Textures/TextureReplace/BoneWelder/AncientPhylactery_Glow.png")

        if (AncientPhylacteryTileTexture != null) {
            Terraria.GameContent.TextureAssets.Tile[BoneWelderTile].Value = AncientPhylacteryTileTexture;
        }

        if (BoneWelderItem != null) {
            Terraria.GameContent.TextureAssets.Item[BoneWelderItem].Value = AncientPhylacteryItemTexture;
        }

        if (AncientPhylacteryOutlineTexture != null) {
            Terraria.GameContent.TextureAssets.HighlightMask[BoneWelderTile].Value = AncientPhylacteryOutlineTexture
        }
        
        if(AncientPhylacteryGlow != null) {
            Terraria.GameContent.TextureAssets.Flames[9] = new ModTexture('Textures/TextureReplace/BoneWelder/AncientPhylactery_Glow').asset.asset
        }
    }
}