import { GlobalTile } from "../../TL/GlobalTile.js";
import { Terraria } from "../../TL/ModImports.js";
import { ModItem } from "../../TL/ModItem.js";
import { Color } from "../../TL/Modules/Color.js";
import { Rand } from "../../TL/Modules/Rand.js";

export class gTilesLoot extends GlobalTile {
    constructor() {
        super()
    }

    static Loots = [
        {
            tileType: Terraria.ID.TileID.LeafBlock,
            loot: 'LivingLeaf',
            condition: (x, y) => Rand.Next(6) === 0
        }
    ];

    Drop(x, y, type) {
        if(gTilesLoot.Loots.find(loot => loot.tileType !== type)) return;

        const lootData = gTilesLoot.Loots.find(l => l.tileType === type);

        if (lootData && (!lootData.condition || lootData.condition(x, y))) {
            let itemId = lootData.loot;

            if (typeof itemId === 'string') {
                itemId = ModItem.getTypeByName(itemId);
            }

            // Assinatura corrigida (sem o bool reverseLookup)
            Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'](
                x * 16, y * 16, 16, 16, itemId, 1, false, 0, false
            );
        }
    }
}

