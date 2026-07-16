import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { ModNPC } from '../../../../TL/ModNPC.js';

const { Color, Vector2, Rand } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement, MoonLordPortraitBackgroundProviderBestiaryInfoElement } = Terraria.GameContent.Bestiary;

export class DistractingJellyfish extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/QueenJellyfish/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.width = 24;
        this.NPC.height = 24;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 1;
        this.NPC.defense = 1;
        this.NPC.lifeMax = 15;
        this.NPC.knockBackResist = 0.5;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.scale = 0.8;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
    }

    CanHitPlayer(npc, target, cooldownSlot) {
        return false;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(
            BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean
        );

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }

    AI(npc) {
        let player = Terraria.Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Terraria.Main.player[npc.target];
        }

        if (player.dead) {
            let vel = npc.velocity;
            vel.Y -= 0.3;
            npc.velocity = vel;
            return;
        }

        // ai[0] = boss whoAmI, ai[1] = state (0=orbiting, 1=chasing)
        const bossIndex = npc.ai[0] | 0;
        const boss = Terraria.Main.npc[bossIndex];
        const isExpert = Terraria.Main.masterMode || Terraria.Main.expertMode;

        // If boss is gone, despawn
        if (!boss.active || boss.life <= 0) {
            npc.active = false;
            return;
        }

        const bossValid = boss.active && boss.life > 0;
        const toBossX = boss.Center.X - npc.Center.X;
        const toBossY = boss.Center.Y - npc.Center.Y;
        const distToBoss = Math.sqrt(toBossX * toBossX + toBossY * toBossY);

        const toPlayerX = player.Center.X - npc.Center.X;
        const toPlayerY = player.Center.Y - npc.Center.Y;

        let vel = npc.velocity;

        if (npc.ai[1] === 0) {
            // Orbiting state: float near boss
            if (distToBoss > 90) {
                const accel = 0.06;
                const maxSpeed = 1.6;
                if (toBossX > 0) {
                    vel.X = Math.min(vel.X + accel, maxSpeed);
                } else {
                    vel.X = Math.max(vel.X - accel, -maxSpeed);
                }
                if (toBossY > 0) {
                    vel.Y = Math.min(vel.Y + accel, maxSpeed);
                } else {
                    vel.Y = Math.max(vel.Y - accel, -maxSpeed);
                }
            } else {
                vel.X *= 0.9;
                vel.Y *= 0.9;
            }

            // Random chance to chase player
            const chaseChance = isExpert ? 100 : 200;
            if (Rand.Next(0, chaseChance) === 0) {
                npc.ai[1] = 1;
            }
        } else {
            // Chasing state
            if (isExpert) {
                // Smoothly track player
                const accel = 0.11;
                const maxSpeed = 2.2;
                if (toPlayerX > 0) {
                    vel.X = Math.min(vel.X + accel, maxSpeed);
                } else {
                    vel.X = Math.max(vel.X - accel, -maxSpeed);
                }
                if (toPlayerY > 0) {
                    vel.Y = Math.min(vel.Y + accel, maxSpeed);
                } else {
                    vel.Y = Math.max(vel.Y - accel, -maxSpeed);
                }
            } else {
                // Simple dash toward player
                const dist = Math.sqrt(toPlayerX * toPlayerX + toPlayerY * toPlayerY) || 1;
                vel.X = (toPlayerX / dist) * 2.5;
                vel.Y = (toPlayerY / dist) * 2.5;
            }

            // Return to orbit if we got close to boss or got hit
            if (distToBoss <= 700 && (npc.justHit || distToBoss < 120)) {
                npc.ai[1] = 0;
            }
        }

        npc.velocity = vel;
        npc.direction = vel.X > 0 ? 1 : -1;
        npc.spriteDirection = npc.direction;
    }

    FindFrame(npc, frameHeight) {
        npc.localAI[3] += 1.0;
        if (npc.localAI[3] >= 6.0) {
            npc.localAI[3] = 0.0;
            npc.localAI[2] = ((npc.localAI[2] | 0) + 1) % 5;
        }
        let frame = npc.frame;
        frame.Y = (npc.localAI[2] | 0) * frameHeight;
        npc.frame = frame;
    }

    HitEffect(npc, hitDirection, damage) {
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = Rand.Next(2, 5);
            NewDust(
                npc.position, npc.width, npc.height,
                59,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                100, Color.Transparent, 1.0
            );
        }
    }
}
