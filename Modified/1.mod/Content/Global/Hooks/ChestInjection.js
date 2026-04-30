import { TileData } from "../../../TL/Modules/TileData.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ChestStyle1 } from "../Enums/ChestStyle1.js";

const { Main, Item, InventoryStorage } = Terraria;

const InjectionRules = [
    {
        type: 21,
        style: ChestStyle1.LivingWood,
        getItemID: () => ModItem.getTypeByName('LivingWoodSap'),
        stack: 1,
        calculateAmount: (total) => Math.max(1, Math.floor(total / 2)),
        action: 'replace'
    },
    {
        type: 21,
        style: ChestStyle1.WebCovered,
        getItemID: () => ModItem.getTypeByName('WebGun'),
        stack: 1,
        calculateAmount: (total) => Math.max(1, Math.floor(total / 2)),
        action: 'replace'
    },
    {
        type: 21,
        style: ChestStyle1.Gold,
        getItemID: () => ModItem.getTypeByName('EnchantedStaff'),
        stack: 1,
        calculateAmount: (total) => Math.max(1, Math.floor(total * 0.15)),
        action: 'replace',
        salt: 397
    },
    {
        type: 21,
        style: ChestStyle1.Gold,
        getItemID: () => ModItem.getTypeByName('EnchantedCane'),
        stack: 1,
        calculateAmount: (total) => Math.max(1, Math.floor(total * 0.15)),
        action: 'replace',
        salt: 613
    }
];

export class ChestInjection {
    Inject() {
        const chestDictionary = this._mapChests();
        const seedHash = this._getSeedHash();
        const usedChests = new Set(); 

        for (let ruleIndex = 0; ruleIndex < InjectionRules.length; ruleIndex++) {
            const rule = InjectionRules[ruleIndex];
            const dictKey = `${rule.type}_${rule.style}`;
            
            let validChests = [...(chestDictionary[dictKey] || [])];

            if (validChests.length === 0) continue;

            const originalTotal = validChests.length; 
            
            validChests = validChests.filter(chestIndex => !usedChests.has(chestIndex));

            const salt = rule.salt ?? (ruleIndex * 179 + 53);
            validChests.sort((a, b) => {
                const hashA = Math.abs((seedHash ^ (a * salt)) % 1000);
                const hashB = Math.abs((seedHash ^ (b * salt)) % 1000);
                return hashA - hashB;
            });

            const amount = rule.calculateAmount(originalTotal);

            for (let j = 0; j < amount && j < validChests.length; j++) {
                const chestIndex = validChests[j];
                
                usedChests.add(chestIndex); 

                const storage = InventoryStorage.new();
                storage['void .ctor(int chest)'](chestIndex);

                const item = Item.new();
                item['void .ctor()']();
                item['void SetDefaults(int Type, ItemVariant variant)'](rule.getItemID(), null);
                item.stack = rule.stack;

                if (rule.action === 'replace') {
                    storage.item[0] = item;
                } else if (rule.action === 'add') {
                    storage.AddItemToShop(item);
                }

                storage.SyncToChest();
            }
        }
    }

    _mapChests() {
        const chests = Main.chest;
        const chestDictionary = {};

        for (let i = 0; i < 8000; i++) {
            const chest = chests[i];
            if (chest === null) continue;

            const tile = new TileData(chest.x, chest.y);
            const style = Math.floor(tile.frameX / 36);
            const dictKey = `${tile.type}_${style}`;

            if (!chestDictionary[dictKey]) chestDictionary[dictKey] = [];
            chestDictionary[dictKey].push(i);
        }

        return chestDictionary;
    }

    _getSeedHash() {
        const seedStr = String(Main.ActiveWorldFileData.Seed);
        let seedHash = 0;
        for (let i = 0; i < seedStr.length; i++) {
            seedHash = (seedHash << 5) - seedHash + seedStr.charCodeAt(i);
        }
        return seedHash;
    }
}