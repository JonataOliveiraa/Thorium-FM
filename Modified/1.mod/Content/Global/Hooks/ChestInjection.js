import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { TileData } from "../../../TL/Modules/TileData.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { AquaticDepths } from "../../Biomes/AquaticDepths.js";
import { ChestStyle1 } from "../Enums/ChestStyle1.js";
import { Terraria } from "../../../TL/ModImports.js";

const { Main, WorldGen, Item, InventoryStorage } = Terraria

const InjectionRules = [
    {
        // Regra original: LivingWoodSap nos baús de Living Wood
        type: 21, 
        style: ChestStyle1.LivingWood,
        // Usamos uma função (getter) para o ID para garantir que o ModItem seja carregado no momento certo
        getItemID: () => ModItem.getTypeByName('LivingWoodSap'),
        stack: 1,
        // Função que define quantos baús recebem. Neste caso: Metade deles (mínimo 1)
        calculateAmount: (totalValidChests) => Math.max(1, Math.floor(totalValidChests / 2)),
        action: 'replace' // 'replace' substitui o slot 0. 'add' usa o AddItemToShop.
    },
    {
        // Nova Regra: WebGun nos baús de Teia
        type: 21,
        style: ChestStyle1.WebCovered,
        getItemID: () => ModItem.getTypeByName('WebGun'),
        stack: 1,
        // Você pediu "pelo menos 1". Essa função pega exatamente 1 baú, se existir.
        calculateAmount: (totalValidChests) => Math.min(1, totalValidChests),
        action: 'replace'
    }
];


// ========================================================================
// 2. MOTOR DE INJEÇÃO (Não precisa mais alterar essa classe)
// ========================================================================
export class ChestInjection extends GlobalHooks {
    Initialize() {
        WorldGen.ShimmerCleanUp.hook((original, self) => {
            original(self);

            // 1. GERANDO BIOMAS
            new AquaticDepths().Generate();

            // 2. MAPEANDO TODOS OS BAÚS DO MUNDO DE UMA SÓ VEZ
            const chests = Main.chest;
            const chestDictionary = {}; // Guarda os baús no formato: "type_style": [index1, index2...]

            for (let i = 0; i < 8000; i++) {
                const chest = chests[i];
                if (chest === null) continue;

                const tile = new TileData(chest.x, chest.y);
                const style = Math.floor(tile.frameX / 36);
                const dictKey = `${tile.type}_${style}`;

                if (!chestDictionary[dictKey]) {
                    chestDictionary[dictKey] = [];
                }
                chestDictionary[dictKey].push(i);
            }

            const seedStr = String(Main.ActiveWorldFileData.Seed);
            let seedHash = 0;
            for (let i = 0; i < seedStr.length; i++) {
                seedHash = (seedHash << 5) - seedHash + seedStr.charCodeAt(i);
            }

            for (const rule of InjectionRules) {
                const dictKey = `${rule.type}_${rule.style}`;
                const validChests = chestDictionary[dictKey] || [];

                if (validChests.length === 0) continue;

                validChests.sort((a, b) => {
                    const hashA = Math.abs((seedHash + a * 397) % 100);
                    const hashB = Math.abs((seedHash + b * 617) % 100);
                    return hashA - hashB;
                });

                const amountToInject = rule.calculateAmount(validChests.length);

                for (let j = 0; j < amountToInject; j++) {
                    const chestIndex = validChests[j];
                    
                    const storage = InventoryStorage.new();
                    storage['void .ctor(int chest)'](chestIndex);

                    const item = Item.new();
                    item['void .ctor()']();
                    
                    const itemID = rule.getItemID();
                    item['void SetDefaults(int Type, ItemVariant variant)'](itemID, null);
                    item.stack = rule.stack;

                    if (rule.action === 'replace') {
                        storage.item[0] = item;
                    } else if (rule.action === 'add') {
                        storage.AddItemToShop(item);
                    }

                    storage.SyncToChest();
                }
            }
        });
    }
}