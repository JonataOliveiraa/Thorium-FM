import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModNPC } from './../../../TL/ModNPC.js';
import { ModLocalization } from './../../../TL/ModLocalization.js';
import { NPCHappiness, AffectionLevel } from './../../../TL/NPCHappiness.js';
import { ModInterface } from './../../UI/ModInterface.js';
import { ShopIcon } from './../../UI/ShopIcon.js';
import { ContractVault } from './../../Global/Contracts/ContractVault.js';
import { VanquisherMedalCurrency } from './../../Items/Tracker/VanquisherMedalCurrency.js';

const { Effects, Rand } = Modules;
const { Main } = Terraria;
const { NPCID } = Terraria.ID;
const {
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const FindFirstNPC = Terraria.NPC['int FindFirstNPC(int Type)'];
const SET_TALK_NPC = 'void SetTalkNPC(int npcIndex)';
const NO_TALK_NPC = -1;

const CHAT_KEYS = ['Tracker_1', 'Tracker_2', 'Tracker_3', 'Tracker_4'];
const STYLIST_CHANCE = 6;
const GYM_CHANCE = 5;

const NAMES = [
    'Aaron', 'Atlas', 'Bernard', 'Brendan', 'Cliffton',
    'Conrad', 'Cyris', 'Dalton', 'Daston', 'Derrick',
    'Garm', 'Gustav', 'Guts', 'Hunter', 'Kwan',
    'Linus', 'Roy', 'Russell', 'Schneider', 'Tristan'
];

export class Tracker extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Town/Tracker/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 25;

        NPCID.Sets.DangerDetectRange[this.Type] = 120;
        NPCID.Sets.ExtraFramesCount[this.Type] = 9;
        NPCID.Sets.AttackFrameCount[this.Type] = 4;
        NPCID.Sets.HatOffsetY[this.Type] = -2;
        NPCID.Sets.ShimmerTownTransform[this.Type] = false;

        NPCID.Sets.NPCBestiaryDrawOffset.Add(
            this.Type,
            NPCID.Sets.NPCBestiaryDrawOffset.get_Item(NPCID.Guide)
        );

        this.BestiaryRarityStars = 3;

        const happiness = new NPCHappiness(this.Type)
            .SetBiomeAffection(Terraria.ID.BiomeID.Snow, AffectionLevel.Like)
            .SetBiomeAffection(Terraria.ID.BiomeID.Forest, AffectionLevel.Dislike)
            .SetNPCAffection(NPCID.DD2Bartender, AffectionLevel.Love)
            .SetNPCAffection(NPCID.Guide, AffectionLevel.Like)
            .SetNPCAffection(NPCID.Stylist, AffectionLevel.Like)
            .SetNPCAffection(NPCID.Princess, AffectionLevel.Like)
            .SetNPCAffection(NPCID.DyeTrader, AffectionLevel.Dislike);

        const acolyte = ModNPC.getTypeByName('DesertAcolyte');
        if (acolyte > 0) happiness.SetNPCAffection(acolyte, AffectionLevel.Hate);
    }

    SetDefaults() {
        this.NPC.townNPC = true;
        this.NPC.friendly = true;
        this.NPC.width = 18;
        this.NPC.height = 40;
        this.NPC.aiStyle = 7;
        this.NPC.damage = 10;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 250;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.knockBackResist = 0.5;
        this.AnimationType = 22;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Snow);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    SetNPCNameList() {
        return NAMES;
    }

    HitEffect(npc, hitDirection, damage) {
        const numDust = npc.life > 0 ? 5 : 15;
        for (let i = 0; i < numDust; i++) {
            Effects.NewDustFromNPC(npc, Terraria.ID.DustID.Blood);
        }
    }

    CanTownNPCSpawn() {
        return Terraria.NPC.downedBoss1;
    }

    GetChat(npc) {
        const stylist = FindFirstNPC(NPCID.Stylist);
        if (stylist >= 0 && Rand.NextBool(STYLIST_CHANCE)) {
            return ModLocalization.Translate('NPCChat.Tracker_Stylist')
                .replace('{0}', Main.npc[stylist].GivenName);
        }

        const bartender = FindFirstNPC(NPCID.DD2Bartender);
        if (bartender >= 0 && Rand.NextBool(GYM_CHANCE)) {
            return ModLocalization.Translate('NPCChat.Tracker_Gym')
                .replace('{0}', Main.npc[bartender].GivenName);
        }

        return ModLocalization.Translate(`NPCChat.${CHAT_KEYS[Rand.Next(CHAT_KEYS.length)]}`);
    }

    SetChatButtons(npc, player, button1, button2) {
        const headSlot = this.NPCHeadSlot();

        button1.text = Terraria.Localization.Language.GetText('LegacyInterface.28').Value;
        button1.texture = ShopIcon.Texture();
        button1.cost = 0;

        button2.text = ModLocalization.Translate('Others.TrackerContracts');
        button2.texture = headSlot >= 0
            ? Terraria.GameContent.TextureAssets.NpcHead[headSlot].Value
            : null;
        button2.cost = 0;
    }

    Option1Clicked(npc, player) {
        this.OpenShop(npc, player);
    }

    Option2Clicked(npc, player) {
        this.CloseChat(player);
        ModInterface.getByName('TrackerInterface')?.Toggle();
    }

    CloseChat(player) {
        player[SET_TALK_NPC](NO_TALK_NPC);
        Main.npcChatText = '';
    }

    SetupShop(npc, player, npcShop) {
        npcShop.Clear();

        if (VanquisherMedalCurrency.CurrencyId === null) return;

        for (const contract of ContractVault.GetContracts()) {
            if (!contract.reward) continue;
            if (!ContractVault.IsCompleted(contract.key)) continue;

            const type = ContractVault.RewardType(contract);
            if (!(type > 0)) continue;

            const slot = npcShop.Add(type);
            if (slot < 0) continue;

            npcShop.item[slot].shopSpecialCurrency = VanquisherMedalCurrency.CurrencyId;
            npcShop.item[slot].value = contract.reward.cost;
        }
    }

    CanGoToStatue(npc, toKingStatue) {
        return toKingStatue;
    }
}
