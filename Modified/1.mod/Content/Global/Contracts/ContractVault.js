import { Terraria } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { WorldDB } from '../../../TL/WorldDB.js';
import { Color } from '../../../TL/Modules/Color.js';

const { Main } = Terraria;

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
const NewText = Main['void NewText(string newText, Color color)'];

const DB_PREFIX = 'Thorium:Contract_';
const MEDAL_STACK = 1;

const COMPLETE_R = 55;
const COMPLETE_G = 231;
const COMPLETE_B = 90;

const CRAWDADS = [494, 495];
const GIANT_SHELLYS = [496, 497];
const SALAMANDERS = [498, 499, 500, 501, 502, 503, 504, 505, 506];

const PINKY = -4;
const LOST_GIRL = 195;
const NYMPH = 196;
const TIM = 45;
const DOCTOR_BONES = 52;

const CORRUPT_ALTAR = 5532;
const CRIMSON_ALTAR = 5533;

function altarItem() {
    return Terraria.WorldGen.crimson ? CRIMSON_ALTAR : CORRUPT_ALTAR;
}

const CONTRACTS = [
    {
        key: 'Danger',
        difficulty: 1,
        vanillaTargets: [...CRAWDADS, ...GIANT_SHELLYS, ...SALAMANDERS],
        modTargets: [],
        reward: { item: 'TrackersSkinningBlade', cost: 2 }
    },
    {
        key: 'Gilded',
        difficulty: 2,
        vanillaTargets: [],
        modTargets: ['GildedBat', 'GildedLycan', 'GildedSlime'],
        reward: { item: 'GlitteringChalice', cost: 5 }
    },
    {
        key: 'Pinky',
        difficulty: 3,
        vanillaTargets: [PINKY],
        modTargets: [],
        reward: { item: 'RosySlimeStaff', cost: 3 }
    },
    {
        key: 'Nymph',
        difficulty: 4,
        vanillaTargets: [LOST_GIRL, NYMPH],
        modTargets: [],
        reward: { item: altarItem, cost: 5 }
    },
    {
        key: 'Tim',
        difficulty: 5,
        vanillaTargets: [TIM],
        modTargets: [],
        reward: { item: 'MalignantThread', cost: 2 }
    },
    {
        key: 'Doctor',
        difficulty: 6,
        vanillaTargets: [DOCTOR_BONES],
        modTargets: [],
        reward: { item: 'Whip', cost: 5 }
    },
    {
        key: 'Minotaur',
        difficulty: 7,
        vanillaTargets: [],
        modTargets: ['RagingMinotaur'],
        reward: { item: 'TheseusThread', cost: 10 }
    },
    {
        key: 'Hag',
        difficulty: 8,
        vanillaTargets: [],
        modTargets: ['BlueHag', 'RedHag', 'GreenHag', 'CyanHag'],
        reward: { item: 'TotemCaller', cost: 5 }
    }
];

let _targetMap = null;
let _medalType = -1;

export class ContractVault {
    static Completed = new Set();

    static GetContracts() {
        return CONTRACTS;
    }

    static Get(key) {
        return CONTRACTS.find(c => c.key === key) ?? null;
    }

    static Title(contract) {
        return ModLocalization.Translate(`MonsterContract.${contract.key}.Title`);
    }

    static Description(contract) {
        return ModLocalization.Translate(`MonsterContract.${contract.key}.Description`);
    }

    static Load() {
        ContractVault.Completed = new Set();
        for (const contract of CONTRACTS) {
            if (WorldDB.get(DB_PREFIX + contract.key) === true) {
                ContractVault.Completed.add(contract.key);
            }
        }
        _targetMap = null;
    }

    static IsCompleted(key) {
        return ContractVault.Completed.has(key);
    }

    static CompletedCount() {
        return ContractVault.Completed.size;
    }

    static Complete(contract) {
        if (ContractVault.Completed.has(contract.key)) return;

        ContractVault.Completed.add(contract.key);
        WorldDB.set(DB_PREFIX + contract.key, true);
        WorldDB.Instance?.Save();

        NewText(
            ModLocalization.Translate('SinalizationChatMessage.ContractCompleted')
                .replace('{0}', ContractVault.Title(contract)),
            Color.new(COMPLETE_R, COMPLETE_G, COMPLETE_B)
        );
    }

    static TargetMap() {
        if (_targetMap) return _targetMap;

        _targetMap = new Map();
        for (const contract of CONTRACTS) {
            for (const id of contract.vanillaTargets) {
                _targetMap.set(id, contract);
            }
            for (const name of contract.modTargets) {
                const type = ModNPC.getTypeByName(name);
                if (type > 0) _targetMap.set(type, contract);
            }
        }
        return _targetMap;
    }

    static RewardType(contract) {
        const reward = contract.reward;
        if (!reward) return 0;

        const item = typeof reward.item === 'function' ? reward.item() : reward.item;

        if (typeof item === 'number') {
            return item > 0 && item < Terraria.ID.ItemID.Count ? item : 0;
        }

        return ModItem.getTypeByName(item) ?? 0;
    }

    static MedalType() {
        if (_medalType === -1) _medalType = ModItem.getTypeByName('VanquisherMedal') ?? -2;
        return _medalType;
    }

    static OnMonsterKilled(npc) {
        const contract = ContractVault.TargetMap().get(npc.netID);
        if (!contract) return;

        const medal = ContractVault.MedalType();
        if (medal > 0) {
            NewItem(npc.position.X, npc.position.Y, npc.width, npc.height, medal, MEDAL_STACK, false, 0, false);
        }

        ContractVault.Complete(contract);
    }
}
