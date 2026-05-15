import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria, Modules } from "../../../TL/ModImports.js";
import { AquaiteTile } from "../Tiles/AquaiteTile.js";
import { LeakyMarineBlock } from "../Tiles/LeakyMarineBlock.js";
import { LeakyMossyMarineBlock } from "../Tiles/LeakyMossyMarineBlock.js";
import { LifeQuartzTile } from "../Tiles/LifeQuartzTile.js";
import { MossyGoldOreTile } from "../Tiles/MossyGoldOreTile.js";
import { MossyPlatinumOreTile } from "../Tiles/MossyPlatinumOreTile.js";
import { OpalTile } from "../Tiles/OpalTile.js";
import { ThoriumOreTile } from "../Tiles/ThoriumOreTile.js";

const { WorldGen } = Terraria;
const {
    Color,
    Vector2
} = Modules

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const ORE_DUST = 9;

export class TileDustReplace extends GlobalHooks {
    Initialize() {
        const dustMap = {
            [AquaiteTile.Type]: Color.new(39, 137, 205),
            [ThoriumOreTile.Type]: Color.new(82, 222, 244),
            [LifeQuartzTile.Type]: Color.new(255, 35, 108),
            [OpalTile.Type]: Color.new(330, 31, 100),
            [LeakyMarineBlock.Type]: Color.new(104, 138, 165),
            [LeakyMossyMarineBlock.Type]: Color.new(105, 160, 165),
            [MossyGoldOreTile.Type]: Color.new(224, 224, 63),
            [MossyPlatinumOreTile.Type]: Color.new(171, 158, 255), 
        }
        
        WorldGen['int KillTile_MakeTileDust(int i, int j, Tile tileCache)'].hook((original, i, j, tileCache) => {
            const color = dustMap[tileCache.type];
            if (color === undefined) return original(i, j, tileCache);

            return NewDust(
                Vector2.new(i * 16, j * 16),
                16, 16,
                ORE_DUST,
                0, 0, 0,
                color,
                1.0
            );
        });
    }
}