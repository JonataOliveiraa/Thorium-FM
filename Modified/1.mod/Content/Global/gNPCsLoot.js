import { GlobalLoot } from "../../TL/GlobalLoot.js";
import { Terraria } from "../../TL/ModImports.js";
import { ModItem } from "../../TL/ModItem.js";

const { ItemDropRule, ItemDropDatabase, Conditions } = Terraria.GameContent.ItemDropRules;
const { NPCID, ItemID } = Terraria.ID;

export class gNPCsLoot extends GlobalLoot {
    constructor(itemDropsDatabase) {
        super(itemDropsDatabase);
    }

    static NPCsLoots = [
        {
            npcType: NPCID.IceSlime,
            rules: [
                () => ItemDropRule.Common(ModItem.getTypeByName('IcyShard'), 4, 1, 1)
            ]
        },
        {
            npcType: NPCID.ZombieEskimo,
            rules: [
                () => ItemDropRule.Common(ModItem.getTypeByName('IcyShard'), 4, 1, 1),
            ]
        },
        {
            npcType: NPCID.BloodZombie,
            rules: [
                () => ItemDropRule.Common(ModItem.getTypeByName('Blood'), 4, 1, 1),
                () => ItemDropRule.Common(ModItem.getTypeByName('UnholyShards'), 10, 1, 2)
            ]
        },
        {
            npcType: NPCID.Drippler,
            rules: [
                () => ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 1, 1),
                () => ItemDropRule.Common(ModItem.getTypeByName('UnholyShards'), 10, 1, 2)
            ]
        },
        {
            npcType: NPCID.Zombie,
            rules: [
                () => {
                    const condition = Conditions.IsBloodMoonAndNotFromStatue.new();
                    return ItemDropRule.ByCondition(condition, ModItem.getTypeByName('Blood'), 10, 1, 1, 1)
                }
            ]
        }
    ];

    ModifyGlobalLoot() {
        for (const npcData of gNPCsLoot.NPCsLoots) {
            for (const rule of npcData.rules) {
                const dropRule = typeof rule === 'function' ? rule() : rule;
                this.RegisterToNPC(npcData.npcType, dropRule);
            }
        }
    }


}