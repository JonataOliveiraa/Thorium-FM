import { Terraria, Modules } from '../../../../TL/ModImports.js';
import { ModLocalization } from '../../../../TL/ModLocalization.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';

const { Color, Vector2, Rand } = Modules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement, MoonLordPortraitBackgroundProviderBestiaryInfoElement } = Terraria.GameContent.Bestiary;

let _bubblePulseType = -1;

export class SpittingJellyfish extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/QueenJellyfish/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.width = 28;
        this.NPC.height = 28;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 10;
        this.NPC.defense = 1;
        this.NPC.lifeMax = 20;
        this.NPC.knockBackResist = 0.75;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = false;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
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

        npc.ai[2]++;

        const dx = player.Center.X - npc.Center.X;
        const dy = player.Center.Y - npc.Center.Y;
        // Hover ~120px above the player, like the other jellyfish minions
        const targetY = player.Center.Y - 120;
        const offsetY = targetY - npc.Center.Y;

        let vel = npc.velocity;
        vel.X = dx > 0
            ? Math.min(vel.X + 0.09, 1.6)
            : Math.max(vel.X - 0.09, -1.6);
        vel.Y = offsetY > 0
            ? Math.min(vel.Y + 0.07, 1.3)
            : Math.max(vel.Y - 0.07, -1.3);
        npc.velocity = vel;
        npc.direction = dx > 0 ? 1 : -1;
        npc.spriteDirection = npc.direction;

        if (npc.ai[2] >= 180 && Terraria.Main.netMode !== 1) {
            npc.ai[2] = 0;
            if (_bubblePulseType < 0) _bubblePulseType = ModProjectile.getTypeByName('BubblePulse');
            if (_bubblePulseType >= 0) {
                const dist = Math.sqrt(dx * dx + dy * dy) || 1;
                NewProjectile(
                    Terraria.Projectile.GetNoneSource(),
                    npc.Center.X, npc.Center.Y,
                    (dx / dist) * 6, (dy / dist) * 6,
                    _bubblePulseType, 12, 2, 255, 0, 0, 0, null
                );
            }
        }
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
        for (let i = 0; i < 10; i++) {
            const angle = (i / 10) * Math.PI * 2;
            const speed = Rand.Next(2, 5);
            NewDust(npc.position, npc.width, npc.height, 57, Math.cos(angle) * speed, Math.sin(angle) * speed, 100, Color.Transparent, 1.0);
        }
    }
}
