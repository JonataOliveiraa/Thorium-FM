import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { AquaticDepths } from "../../Biomes/AquaticDepths.js";

const Main = new NativeClass('Terraria', 'Main');
const WorldGen = new NativeClass('Terraria', 'WorldGen');
const Item = new NativeClass('Terraria', 'Item');
const InventoryStorage = new NativeClass('Terraria', 'InventoryStorage');

export class ChestInjection extends GlobalHooks {
    Initialize() {
        WorldGen.ShimmerCleanUp.hook((original, self) => {
            original(self);

            //GERANDO BIOMA
            new AquaticDepths().Generate()

            //ADICIONANDO ITENS NOS BAUS
            const chests = Main.chest;
            const validChests = [];

            for (let i = 0; i < 8000; i++) {
                const chest = chests[i];
                if (chest === null) continue;

                const tile = new TileData(chest.x, chest.y);
                const style = Math.floor(tile.frameX / 36);
                const isLivingWoodChest = tile.type === 21 && style === 12;

                if (isLivingWoodChest) {
                    validChests.push(i);
                }
            }

            if (validChests.length === 0) return;

            const seedStr = String(Main.ActiveWorldFileData.Seed);
            let seedHash = 0;
            for (let i = 0; i < seedStr.length; i++) {
                seedHash = (seedHash << 5) - seedHash + seedStr.charCodeAt(i);
            }

            validChests.sort((a, b) => {
                const hashA = Math.abs((seedHash + a * 397) % 100);
                const hashB = Math.abs((seedHash + b * 617) % 100);
                return hashA - hashB;
            });

            const amountToInject = Math.max(1, Math.floor(validChests.length / 2));

            for (let j = 0; j < amountToInject; j++) {
                const chestIndex = validChests[j];
                
                const storage = InventoryStorage.new();
                storage['void .ctor(int chest)'](chestIndex);

                const item = Item.new();
                item['void .ctor()']();
                
                const accessoryID = ModItem.getTypeByName('LivingWoodSap');
                item['void SetDefaults(int Type, ItemVariant variant)'](accessoryID, null);
                item.stack = 1;

                storage.item[0] = item;
                storage.SyncToChest();
            }

        });
    }
}