import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GelatinousSludge extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Dungeon/' + this.constructor.name;
        this._liquefied = -1;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 2;
        this.BestiaryRarityStars = 1;
    }

    SetDefaults() {
        this.NPC.width = 28;
        this.NPC.height = 24;
        this.NPC.aiStyle = 1;
        this.NPC.damage = 20;
        this.NPC.defense = 0;
        this.NPC.lifeMax = 20;
        this.NPC.alpha = 125;
        this.NPC.knockBackResist = 0.5;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit19;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 0);
        this.AIType = 1;
        this.AnimationType = 1;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheDungeon);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GelatinousSludge');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        return 0;
    }

    FindFrame(npc, frameHeight) {
        if (npc.velocity.Y !== 0) {
            npc.localAI[2] = 1;
            return;
        }

        if (npc.localAI[2] === 0) return;
        npc.localAI[2] = 0;

        const player = Main.player[npc.target];
        if (!player || !player.active) return;

        npc.spriteDirection = player.Center.X < npc.Center.X ? -1 : 1;
    }

    OnHitPlayer(npc, player) {
        if (Math.random() >= 0.125) return;
        if (this._liquefied === -1) this._liquefied = ModBuff.getTypeByName('Liquefied') ?? -2;
        if (this._liquefied > 0) player.AddBuff(this._liquefied, 180, false);
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 20; i++) NewDust(npc.position, npc.width, npc.height, 46, 2.5 * hitDirection, -2.5, 150, Color.White, 1);
            return;
        }

        const count = Math.min(10, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) NewDust(npc.position, npc.width, npc.height, 46, hitDirection, -1, 150, Color.White, 0.75);
    }
}
