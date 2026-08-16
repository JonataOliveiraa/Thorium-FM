import { Terraria, Modules } from './../../../../TL/ModImports.js';
import { ModNPC } from './../../../../TL/ModNPC.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const ORBIT_RADIUS = 90;
const ORBIT_ANGLE = 0.785;
const ORBIT_SPEED = 0.05;
const ORBIT_SPEED_ENRAGED = 0.12;
const LIFETIME = 118;

// Mesmo motivo do CoalescedEnergy: a instancia de ModNPC e' unica por tipo, entao
// timer/rot precisam viver em localAI ou os 8 orbes somam no mesmo contador.
const ROT = 0;
const TIMER = 1;

let bossType = -1;

function initializeBossType() {
    if (bossType >= 0) return;
    bossType = ModNPC.getTypeByName('GraniteEnergyStorm') ?? -1;
}

export class EnergyBarrier extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/GraniteEnergyStorm/' + this.constructor.name;
    }

    // Roda todo tick para os 8 orbes: position/width/height sao interop, entao le
    // uma vez e reaproveita nas 3 particulas.
    _createTrailDust(npc) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        for (let index = 0; index < 3; index++) {
            const dustIndex = Effects.NewDust(position, width, height, 15, 0, 0, 0, white, 1);
            Main.dust[dustIndex].noGravity = true;
        }
    }

    _createDespawnDust(npc) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        for (let index = 0; index < 20; index++) {
            Effects.NewDust(position, width, height, 15, Rand.Next(-2, 2), Rand.Next(-2, 2), 150, white, 0.75);
        }
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.aiStyle = -1;
        this.NPC.lifeMax = 500;
        this.NPC.damage = 0;
        this.NPC.defense = 100;
        this.NPC.knockBackResist = 0;
        this.NPC.alpha = 80;
        this.NPC.width = 12;
        this.NPC.height = 12;
        this.NPC.lavaImmune = true;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit3;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath6;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        // A barreira nunca causa dano de contato, nem depois do scaling de expert/master.
        npc.damage = 0;
        npc.lifeMax = Math.floor(npc.lifeMax * 0.75 * balance * bossAdjustment);
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const white = Color.White;

        if (npc.life <= 0) {
            for (let index = 0; index < 20; index++) Effects.NewDust(position, width, height, 15, Rand.Next(-4, 4), Rand.Next(-4, 4), 0, white, 0.8);
            return;
        }

        const count = Math.floor(damage / npc.lifeMax * 50);
        for (let index = 0; index < count; index++) {
            Effects.NewDust(position, width, height, 15, Rand.Next(-2, 2), Rand.Next(-2, 2), 0, white, 0.6);
            Effects.NewDust(position, width, height, 37, Rand.Next(-3, 3), Rand.Next(-3, 3), 0, white, 0.8);
        }
    }

    FindFrame(npc, frameHeight) {
        npc.frameCounter = (npc.frameCounter + 1) % 120;

        const frame = npc.frame;
        frame.Y = frameHeight * (Math.floor(npc.frameCounter) % 20 / 5 | 0);
        npc.frame = frame;
    }

    AI(npc) {
        initializeBossType();

        const boss = Main.npc[Math.floor(npc.ai[0])];
        if (!boss || !boss.active || boss.type !== bossType) {
            npc.active = false;
            return;
        }

        npc.localAI[TIMER]++;
        npc.localAI[ROT] += boss.life < boss.lifeMax * 0.35 ? ORBIT_SPEED_ENRAGED : ORBIT_SPEED;

        const angle = npc.localAI[ROT] + npc.ai[2] * ORBIT_ANGLE;
        npc.Center = Vector2.Add(boss.Center, Vector2.RotatedBy(Vector2.new(0, ORBIT_RADIUS), angle));

        this._createTrailDust(npc);

        if (npc.localAI[TIMER] < LIFETIME) return;

        this._createDespawnDust(npc);
        npc.active = false;
    }
}
