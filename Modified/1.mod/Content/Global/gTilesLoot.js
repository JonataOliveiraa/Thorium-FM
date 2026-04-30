import { GlobalTile } from "../../TL/GlobalTile.js";
import { Terraria } from "../../TL/ModImports.js";
import { ModItem } from "../../TL/ModItem.js";
import { Rand } from "../../TL/Modules/Rand.js";

export class gTilesLoot extends GlobalTile {
    constructor() {
        super();
    }

    static Loots = [
        { tileType: Terraria.ID.TileID.LeafBlock, loot: 'LivingLeaf', condition: (x, y) => Rand.Next(6) === 0 },
        { tileType: Terraria.ID.TileID.TeamBlockBlue, loot: 'ThoriumOre', condition: null },
        { tileType: Terraria.ID.TileID.TeamBlockRed, loot: 'LifeQuartzOre', condition: null },
        { tileType: Terraria.ID.TileID.AncientBlueBrick, loot: 'AquaiteOre', condition: null },
        { tileType: Terraria.ID.TileID.AncientPinkBrick, loot: Terraria.ID.ItemID.GoldOre, condition: null },
        { tileType: Terraria.ID.TileID.ForbiddenBlock, loot: Terraria.ID.ItemID.PlatinumOre, condition: null },
        { tileType: Terraria.ID.TileID.TeamBlockPink, loot: 'AquamarineGem', condition: null },
        { tileType: Terraria.ID.TileID.AncientGreenBrick, loot: 'AquamarineGem', condition: null },
        { tileType: Terraria.ID.TileID.AncientGoldBrick, loot: 'OpalGem', condition: null }
    ];

    CanDrop(x, y, type) {
        const lootData = gTilesLoot.Loots.find(l => l.tileType === type);
        if (!lootData) return true;

        if (lootData.condition && !lootData.condition(x, y)) {
            return true;
        }

        let itemId = lootData.loot;
        if (typeof itemId === 'string') {
            itemId = ModItem.getTypeByName(itemId);
            if (!itemId) {
                return true;
            }
        }

        const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
        NewItem(x * 16, y * 16, 16, 16, itemId, 1, false, 0, false);

        return false;
    }
}