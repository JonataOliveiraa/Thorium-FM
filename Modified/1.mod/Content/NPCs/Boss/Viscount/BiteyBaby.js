import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { FxHelper } from '../../../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const HEAL_AMOUNT = 25;
const SPEED = 4.0;
const OSC = 3.0; // amplitude da oscilacao lateral do voo
const HEAL_COOLDOWN = 90; // evita que um enxame devolva metade da vida do boss

let _viscountType = -1;
let _bossIndex = -1; // evita varrer Main.npc inteiro a cada mordida

export class BiteyBaby extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/Viscount/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 4;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.width = 32;
        this.NPC.height = 32;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 30;
        this.NPC.knockBackResist = 0.45;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.scale = 0.8;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = 0;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
    }

    ApplyDifficultyAndPlayerScaling(npc, numPlayers, balance, bossAdjustment) {
        npc.lifeMax = Math.floor(30 * 0.7);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    FindFrame(npc, frameHeight) {
        npc.frameCounter++;
        if (npc.frameCounter > 5) {
            npc.frameCounter = 0;
            const frame = npc.frame;
            frame.Y = (((frame.Y / frameHeight | 0) + 1) % 4) * frameHeight;
            npc.frame = frame;
        }
    }

    AI(npc) {
        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }

        if (!player || !player.active || player.dead) {
            npc.EncourageDespawn(10);
            let v = npc.velocity;
            v.Y -= 0.2;
            npc.velocity = v;
            return;
        }

        if (npc.localAI[2] > 0) npc.localAI[2]--;

        npc.ai[0] += 0.05;
        if (npc.ai[0] > Math.PI * 2) npc.ai[0] -= Math.PI * 2;

        const center = npc.Center;
        const target = player.Center;
        const vel = npc.velocity;

        const toX = target.X - center.X;
        const toY = target.Y - center.Y;
        const dist = Math.sqrt(toX * toX + toY * toY) || 1;
        let dirX = toX / dist;
        let dirY = toY / dist;

        npc.localAI[0]--;
        if (npc.localAI[0] <= 0) {
            npc.localAI[0] = 20 + Math.random() * 20;
            npc.localAI[1] = (Math.random() - 0.5) * 0.5;
        }

        const cosA = Math.cos(npc.localAI[1]);
        const sinA = Math.sin(npc.localAI[1]);
        const rx = dirX * cosA - dirY * sinA;
        dirY = dirX * sinA + dirY * cosA;
        dirX = rx;

        const sine = Math.sin(npc.ai[0]);
        let velX = vel.X * 0.2 + (dirX * SPEED - dirY * sine * OSC) * 0.8;
        let velY = vel.Y * 0.2 + (dirY * SPEED + dirX * sine * OSC) * 0.8;

        const maxSpeed = SPEED + OSC * 0.6;
        const sqrMag = velX * velX + velY * velY;
        if (sqrMag > maxSpeed * maxSpeed) {
            const scale = maxSpeed / Math.sqrt(sqrMag);
            velX *= scale;
            velY *= scale;
        }

        velX += (Math.random() - 0.5) * 0.3;
        velY += (Math.random() - 0.5) * 0.3;
        if (npc.wet) velY -= 0.5;

        npc.velocity = Vector2.new(velX, velY);

        if (Math.abs(velX) > 0.4) npc.direction = velX > 0 ? 1 : -1;
        npc.spriteDirection = toX > 0 ? 1 : -1;
    }

    OnHitPlayer(npc, player) {
        if (_viscountType === -1) _viscountType = ModNPC.getTypeByName('Viscount');
        if (_viscountType < 0 || npc.localAI[2] > 0) return;
        npc.localAI[2] = HEAL_COOLDOWN;

        let boss = _bossIndex >= 0 ? Main.npc[_bossIndex] : null;
        if (!boss || !boss.active || boss.type !== _viscountType) {
            boss = null;
            for (let i = 0; i < Main.maxNPCs; i++) {
                const candidate = Main.npc[i];
                if (candidate && candidate.active && candidate.type === _viscountType) {
                    _bossIndex = i;
                    boss = candidate;
                    break;
                }
            }
        }

        if (!boss || boss.life >= boss.lifeMax) return;

        const bossCenter = boss.Center;
        const center = npc.Center;
        const dx = bossCenter.X - center.X;
        const dy = bossCenter.Y - center.Y;
        if (dx * dx + dy * dy >= 250000) return;

        boss.life = Math.min(boss.life + HEAL_AMOUNT, boss.lifeMax);
        try { boss['void HealEffect(int healAmount, bool broadcast)'](HEAL_AMOUNT, true); } catch (_) { }

        FxHelper.ring(bossCenter.X, bossCenter.Y, 12, 80, 80, 5, 4, 1.25, 0, 75, true);
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 5, 54, 2.5, 0.75, 0, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 5, 5, 2.5, 0.75, 100, false);
            return;
        }

        const count = Math.min(4, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            Effects.NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 0, Color.White, 0.75);
        }
    }
}
