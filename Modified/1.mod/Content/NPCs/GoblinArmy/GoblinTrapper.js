import { Terraria, Modules } from "../../../TL/ModImports.js";
import { ModNPC } from "../../../TL/ModNPC.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { ModItem } from "../../../TL/ModItem.js";
import { Effects } from "../../../TL/Modules/Effects.js";

const { Main, Dust, Collision } = Terraria;
const { Vector2, Color } = Modules;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;

const NewDust = Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const CanHit = Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const GetSource_ForNPC = 'IEntitySource GetSpawnSourceForNPCFromNPCAI()';

let _spikeBallType = -1;

const START_DIST_SQ = 275 * 275;   // 75625
const STOP_DIST_SQ  = 375 * 375;   // 140625

const WINDUP     = 180;            // comeca a animacao de conjurar
const FIRST_SHOT = 190;
const SHOT_DELAY = 15;
const SHOT_COUNT = 3;
const LAST_SHOT  = FIRST_SHOT + SHOT_DELAY * (SHOT_COUNT - 1); // 220
const CYCLE_END  = 225;

// Frames (npcFrameCount = 19)
const WALK_FIRST = 1;
const WALK_LAST  = 14;
const JUMP_FRAME = 15;
const CAST_FIRST = 16;

export class GoblinTrapper extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/GoblinArmy/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 19;
    }

    SetDefaults() {
        this.NPC.width = 18;
        this.NPC.height = 50;
        this.NPC.damage = 20;
        this.NPC.defense = 6;
        this.NPC.lifeMax = 90;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.knockBackResist = 0.6;
        this.NPC.aiStyle = 3;
        this.NPC.scale = 1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 20, 0);

        // AIType/AnimationType sao do TIPO, nunca podem ser trocados em runtime.
        // 28 = Goblin Warrior (AI de fighter).
        this.AIType = 28;
    }

    // localAI[0] = 1 enquanto conjurando
    // localAI[1] = timer do cast
    PreAI(npc) {
        if (npc.target < 0 || npc.target === 255 || !Main.player[npc.target].active || Main.player[npc.target].dead) {
            npc.TargetClosest(true);
        }

        const player = Main.player[npc.target];
        if (!player || !player.active) return true;

        let casting = npc.localAI[0] === 1;
        const distSq = Vector2.DistanceSquared(player.Center, npc.Center);

        if (Main.invasionType !== 1 || npc.confused || player.dead) {
            casting = false;
        } else if (!casting && npc.velocity.Y === 0 && distSq < START_DIST_SQ) {
            casting = true;
        } else if (casting && distSq > STOP_DIST_SQ) {
            casting = false;
        }

        if (casting && !CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height)) {
            casting = false;
        }

        if (!casting) {
            if (npc.localAI[0] === 1) {
                npc.localAI[0] = 0;
                npc.localAI[1] = 0;
                npc.netUpdate = true;
            }
            return true; // deixa a AI vanilla (fighter) rodar
        }

        if (npc.localAI[0] === 0) {
            npc.localAI[0] = 1;
            npc.localAI[1] = 0;
            npc.netUpdate = true;
        }

        this.Cast(npc, player);
        return false; // pula a AI vanilla; AI() tambem nao e chamado nesse tick
    }

    Cast(npc, player) {
        npc.direction = player.Center.X > npc.Center.X ? 1 : -1;
        npc.spriteDirection = npc.direction;

        const vel = npc.velocity;
        vel.X *= 0.8;
        if (Math.abs(vel.X) < 0.1) vel.X = 0;
        if (vel.Y < 10) vel.Y += 0.3;
        npc.velocity = vel;

        npc.localAI[1]++;
        const t = npc.localAI[1];

        if (t >= FIRST_SHOT && t <= LAST_SHOT && (t - FIRST_SHOT) % SHOT_DELAY === 0) {
            Effects.PlaySound(Terraria.ID.SoundID.Item19, npc.Center.X, npc.Center.Y);

            if (Main.netMode !== 1) {
                if (_spikeBallType < 0) _spikeBallType = ModProjectile.getTypeByName('HostileSpikeBall');

                if (_spikeBallType >= 0) {
                    const speed = 6 - Math.floor((t - FIRST_SHOT) / SHOT_DELAY); // 6, 5, 4
                    const spawnX = npc.Center.X + 8 * npc.spriteDirection;
                    const spawnY = npc.Center.Y - 10;

                    const dx = player.Center.X - spawnX;
                    const dy = player.Center.Y - spawnY;
                    const len = Math.sqrt(dx * dx + dy * dy) || 1;

                    NewProjectile(
                        npc[GetSource_ForNPC](),
                        spawnX, spawnY,
                        (dx / len) * speed, (dy / len) * speed,
                        _spikeBallType, 10, 0, Main.myPlayer,
                        0, 0, 0, null
                    );
                }
            }
        }

        if (t >= CYCLE_END) {
            npc.localAI[1] = 0;
        }
    }

    FindFrame(npc, frameHeight) {
        const frame = npc.frame;

        if (npc.localAI[0] === 1) {
            npc.frameCounter = 0;
            frame.Y = npc.localAI[1] < WINDUP
                ? 0
                : (CAST_FIRST + Math.floor((npc.localAI[1] - WINDUP) / 5) % 3) * frameHeight;
            npc.frame = frame;
            return;
        }

        npc.spriteDirection = npc.direction;

        if (npc.velocity.Y !== 0) {
            frame.Y = JUMP_FRAME * frameHeight;
            npc.frame = frame;
            return;
        }

        if (npc.velocity.X === 0) {
            npc.frameCounter = 0;
            frame.Y = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X) * 0.75;
        if (npc.frameCounter >= 3) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;
        }

        if (frame.Y < WALK_FIRST * frameHeight || frame.Y > WALK_LAST * frameHeight) {
            frame.Y = WALK_FIRST * frameHeight;
        }

        npc.frame = frame;
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 10; i++) {
                NewDust(npc.position, npc.width, npc.height, 5, 2.5 * hitDirection, -2.5, 0, Color.White, 0.8);
            }
            return;
        }

        npc.localAI[1] = 0;

        const dustCount = Math.floor((damage / npc.lifeMax) * 50);
        for (let i = 0; i < dustCount; i++) {
            NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 0, Color.White, 0.6);
        }
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(161, 2, 1, 5));
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('YewWood'), 2, 4, 8));
    }

    SpawnChance(spawnInfo) {
        if (!spawnInfo.GoblinArmy) return 0;
        return 0.2;
    }
}