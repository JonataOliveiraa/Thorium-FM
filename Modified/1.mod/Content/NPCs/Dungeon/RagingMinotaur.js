import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class RagingMinotaur extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Dungeon/' + this.constructor.name;
        this._staggered = -1;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 15;
        Terraria.ID.NPCID.Sets.StatueSpawnedDropRarity[this.Type] = 0.05;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.width = 36;
        this.NPC.height = 40;
        this.NPC.aiStyle = 26;
        this.NPC.damage = 35;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 400;
        this.NPC.scale = 1.2;
        this.NPC.rarity = 2;
        this.NPC.knockBackResist = 0;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit12;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath8;
        this.NPC.value = ModNPC.NPCValue(0, 0, 5, 0);
        this.AIType = 86;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[31] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheDungeon);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.RagingMinotaur');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Dungeon) return 0;
        return (Main.hardMode && Terraria.NPC.downedPlantBoss) ? 0.01 : 0.04;
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;

        const vel = npc.velocity;
        let counter = npc.localAI[0];

        if (Math.abs(vel.Y) > 0.5) {
            counter = 0;
        } else if (Math.abs(vel.X) > 4) {
            npc.frameCounter++;
            if (npc.frameCounter > 2) {
                counter++;
                if (counter > 14) counter = 7;
                npc.frameCounter = 0;
            }
        } else {
            npc.frameCounter++;
            if (npc.frameCounter > 4 - 0.25 * Math.abs(vel.X)) {
                counter++;
                if (counter >= 7) counter = 1;
                npc.frameCounter = 0;
            }
        }

        npc.localAI[0] = counter;
        const frame = npc.frame;
        frame.Y = counter * frameHeight;
        npc.frame = frame;
    }

    OnHitPlayer(npc, player) {
        if (Math.random() >= 0.2) return;
        if (this._staggered === -1) this._staggered = ModBuff.getTypeByName('Staggered') ?? -2;
        if (this._staggered > 0) player.AddBuff(this._staggered, 600, false);
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 20; i++) NewDust(npc.position, npc.width, npc.height, 11, 2.5 * hitDirection, -2.5, 125, Color.White, 1.5);
            return;
        }

        const count = Math.min(12, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 0, Color.White, 1.5);
    }

    BeforeLoot(npc, player) {
        return Terraria.NPC.downedBoss3;
    }

    ModifyNPCLoot(npcLoot) {
        const elephantGun = ModItem.getTypeByName('ElephantGun');
        if (elephantGun > 0) npcLoot.Add(ItemDropRule.Common(elephantGun, 5, 1, 1));
        npcLoot.Add(ItemDropRule.Common(327, 65, 1, 1));
        npcLoot.Add(ItemDropRule.Common(3095, 100, 1, 1));
    }
}
