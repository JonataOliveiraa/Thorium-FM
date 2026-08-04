import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const DEMON_EYE = 2;
const LAUNCH_SPEED = -5;
const ARM_DELAY = 30;
const DUST_GORE = 5;
const DUST_LEAF = 39;

export class CorpsePetal extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
        this.AnimationType = DEMON_EYE;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = Main.npcFrameCount[DEMON_EYE];
        Terraria.ID.NPCID.Sets.CantTakeLunchMoney[this.Type] = true;
        Terraria.ID.NPCID.Sets.DontDoHardmodeScaling[this.Type] = true;
        this.hideFromBestiary = true;
    }

    SetDefaults() {
        this.NPC.width = 32;
        this.NPC.height = 32;
        this.NPC.lifeMax = 50;
        this.NPC.damage = 25;
        this.NPC.defense = 0;
        this.NPC.knockBackResist = 0.8;
        this.NPC.dontTakeDamage = true;
        this.NPC.aiStyle = -1;
        this.NPC.noGravity = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = 0;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
        npc.buffImmune[31] = true;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        npc.lifeMax = Math.floor(50 * 0.75 * balance);
    }

    OnSpawn(npc) {
        npc.localAI[2] = 255;
        npc.velocity = Vector2.new(npc.ai[0], LAUNCH_SPEED);
    }

    CanFallThroughPlatforms(npc) {
        return true;
    }

    AI(npc) {
        if (npc.aiStyle === DEMON_EYE) return;

        npc.velocity = Vector2.Multiply(npc.velocity, 0.975);

        if (++npc.ai[1] <= ARM_DELAY) return;

        npc.dontTakeDamage = false;
        npc.aiStyle = DEMON_EYE;
        npc.ai[1] = 0;
        npc.netUpdate = true;
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 10, DUST_LEAF, 2.5, 1, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 10, DUST_GORE, 2.5, 1, 0, false);
            return;
        }

        const count = Math.min(5, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            Effects.NewDust(npc.position, npc.width, npc.height, DUST_LEAF, hitDirection, -1, 0, Color.White, 0.75);
        }
    }
}
