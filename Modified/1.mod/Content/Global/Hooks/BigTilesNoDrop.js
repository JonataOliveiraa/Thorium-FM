import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Color } from "../../../TL/Modules/Color.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";

export class BigTilesNoDrop extends GlobalHooks {

    Tiles3x2 = [
        {
            type: Terraria.ID.TileID.Tables2,
            styles: [20, 30, 27],
            drop: null
        }
    ];

    Tiles3x3 = [
        {
            type: Terraria.ID.TileID.LihzahrdFurnace,
            styles: [0],
            drop: () => ModItem.getTypeByName('SpiritsGrace')
        }
    ];

    _handleCheck(tiles, sizeY, i, j, type) {
        const tile = new TileData(i, j);
        if (!tile.tile['bool active()']()) return false;

        const frameWidth = 54;
        const styleFrameX = tile.frameX % frameWidth;
        const currentStyle = Math.floor(tile.frameX / frameWidth);

        const tileConfig = tiles.find(t =>
            t.type === type &&
            t.styles.includes(currentStyle)
        );
        if (!tileConfig) return false;

        const col = Math.floor(styleFrameX / 18);
        const row = Math.floor(tile.frameY / 18);
        const topLeftX = i - col;
        const topLeftY = j - row;

        const wasDestroying = Terraria.WorldGen.destroyObject;
        Terraria.WorldGen.destroyObject = true;

        const get = Terraria.Main.tile.get_Item;
        for (let dx = 0; dx < 3; dx++) {
            for (let dy = 0; dy < sizeY; dy++) {
                const tx = topLeftX + dx;
                const ty = topLeftY + dy;

                if (tx < 0 || tx >= Terraria.Main.maxTilesX) continue;
                if (ty < 0 || ty >= Terraria.Main.maxTilesY) continue;
                const t = get(tx, ty);
                if (t['bool active()']() && t.type === type) {
                    t['void active(bool active)'](false);

                    const worldX = (tx + 0.5) * 16;
                    const worldY = (ty + 0.5) * 16;

                    Terraria.Dust.NewDust(
                        Vector2.new(worldX - 8, worldY - 8),
                        16, 16,
                        Terraria.ID.DustID.Stone,
                        0, 0,
                        0,
                        Color.new(53, 55, 96),
                        1.0
                    );
                    t.frameX = 0;
                    t.frameY = 0;
                }
            }
        }

        if (tileConfig.drop) {
            const itemType = typeof tileConfig.drop === 'function' ? tileConfig.drop() : tileConfig.drop;
            if (itemType) {
                Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'](
                    (topLeftX + 1) * 16, topLeftY * 16, 32, 32, itemType, 1, false, 0, false
                );
            }
        }

        Terraria.WorldGen.destroyObject = wasDestroying;
        return true;
    }

    Initialize() {
        Terraria.WorldGen['void Check3x2(int i, int j, int type)'].hook((original, i, j, type) => {
            if (!this._handleCheck(this.Tiles3x2, 2, i, j, type)) return original(i, j, type);
        });

        Terraria.WorldGen['void Check3x3(int i, int j, int type)'].hook((original, i, j, type) => {
            if (!this._handleCheck(this.Tiles3x3, 3, i, j, type)) return original(i, j, type);
        });
    }
}