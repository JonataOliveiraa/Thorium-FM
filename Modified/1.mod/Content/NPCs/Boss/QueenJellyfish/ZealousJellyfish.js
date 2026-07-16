import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { ModNPC } from '../../../../TL/ModNPC.js';

const { Color, Vector2, Rand } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement, MoonLordPortraitBackgroundProviderBestiaryInfoElement } = Terraria.GameContent.Bestiary;

export class ZealousJellyfish extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/QueenJellyfish/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.width = 30;
        this.NPC.height = 30;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 15;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 25;
        this.NPC.knockBackResist = 0.8;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = false;
        this.NPC.scale = 1.15;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
    }

    AI(npc) {
        // Target
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

        // ai[1] = dash timer
        npc.ai[1]++;

        const dx = player.Center.X - npc.Center.X;
        const dy = player.Center.Y - npc.Center.Y;

        if (npc.ai[1] >= 240) {
            // Dash directly at player
            if (npc.ai[1] === 240) {
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                let vel = npc.velocity;
                vel.X = (dx / dist) * 5.5;
                vel.Y = (dy / dist) * 5.5;
                npc.velocity = vel;
            }
            if (npc.ai[1] >= 280) {
                npc.ai[1] = 0;
            }
            return;
        }

        // Bat-AI style movement toward player
        let vel = npc.velocity;
        const accelX = 0.09;
        const accelY = 0.06;
        const maxX = 1.6;
        const maxY = 1.3;

        if (dx > 0) {
            vel.X = Math.min(vel.X + accelX, maxX);
        } else {
            vel.X = Math.max(vel.X - accelX, -maxX);
        }

        if (dy > 0) {
            vel.Y = Math.min(vel.Y + accelY, maxY);
        } else {
            vel.Y = Math.max(vel.Y - accelY, -maxY);
        }

        npc.velocity = vel;
        npc.direction = dx > 0 ? 1 : -1;
        npc.spriteDirection = npc.direction;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(
            BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Ocean
        );

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
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
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = Rand.Next(2, 5);
            NewDust(
                npc.position, npc.width, npc.height,
                60,
                Math.cos(angle) * speed, Math.sin(angle) * speed,
                100, Color.Transparent, 1.0
            );
        }
    }
}
