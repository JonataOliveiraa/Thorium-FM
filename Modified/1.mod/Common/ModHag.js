import { Terraria, Modules } from '../TL/ModImports.js';
import { ModNPC } from '../TL/ModNPC.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const FindTeleportSpot = 'bool AI_AttemptToFindTeleportSpot(ref Vector2 chosenTile, int targetTileX, int targetTileY, int rangeFromTargetTile, int telefragPreventionDistanceInTiles, int solidTileCheckFluff, bool solidTileCheckCentered, bool teleportInAir)';

export class ModHag extends ModNPC {
    constructor() {
        super();
        this.TeleportDust = -1;
        this.AttackDust = -1;
        this.DeathDustAlpha = 0;
        this.AttackSound = null;
        this.LightR = 0;
        this.LightG = 0;
        this.LightB = 0;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 3;
        this.BestiaryRarityStars = 2;
    }

    SetDefaults() {
        this.NPC.width = 18;
        this.NPC.height = 32;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 25;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 230;
        this.NPC.scale = 1;
        this.NPC.rarity = 1;
        this.NPC.npcSlots = 4;
        this.NPC.knockBackResist = 0.35;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 50, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[31] = true;
    }

    OnSpawn(npc) {
        npc.ai[0] = 500;
    }

    HagShoot(npc, player) { }

    TeleportBurst(npc) {
        Effects.PlaySound(Terraria.ID.SoundID.Item8, npc.Center.X | 0, npc.Center.Y | 0);
        if (this.TeleportDust < 0 || Main.netMode === 2) return;

        for (let i = 0; i < 30; i++) {
            const dust = Main.dust[NewDust(npc.position, npc.width, npc.height, this.TeleportDust, 0, 0, 100, Color.White, 1.8)];
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, 3);
            dust.noGravity = true;
        }
    }

    AI(npc) {
        if (npc.target < 0 || npc.target === 255 || !Main.player[npc.target].active || Main.player[npc.target].dead) {
            npc.TargetClosest(true);
        }
        const player = Main.player[npc.target];
        if (!player) return;

        Effects.AddLight(npc.Center, this.LightR, this.LightG, this.LightB);
        npc.spriteDirection = player.Center.X > npc.Center.X ? 1 : -1;

        const vel = npc.velocity;
        vel.X *= 0.93;
        if (vel.X > -0.1 && vel.X < 0.1) vel.X = 0;
        npc.velocity = vel;

        npc.ai[0]++;
        if (npc.ai[0] >= 650) {
            npc.ai[0] = 0;

            const spot = Vector2.new(0, 0);
            const tileX = Math.floor(player.Center.X / 16);
            const tileY = Math.floor(player.Center.Y / 16);

            if (npc[FindTeleportSpot](spot, tileX, tileY, 20, 5, 1, false, false)) {
                this.TeleportBurst(npc);
                npc.position = Vector2.new(spot.X * 16 - npc.width / 2 + 8, spot.Y * 16 - npc.height);
                npc.velocity = Vector2.Zero;
                npc.netOffset = Vector2.Zero;
                this.TeleportBurst(npc);
            }

            npc.TargetClosest(true);
        }

        const dx = npc.Center.X - player.Center.X;
        const dy = npc.Center.Y - player.Center.Y;
        if (player.dead || dx * dx + dy * dy >= 1000000) {
            npc.localAI[0] = 0;
            return;
        }

        npc.ai[1]++;

        if (npc.ai[1] >= 150) npc.localAI[0] = 1;

        if (npc.ai[1] === 150 && this.AttackDust >= 0 && Main.netMode !== 2) {
            for (let i = 0; i < 10; i++) {
                NewDust(npc.position, npc.width, npc.height, this.AttackDust, Math.random() * 12 - 6, Math.random() * 12 - 6, 0, Color.White, 1.4);
            }
        }

        if (npc.ai[1] < 180) return;

        if (this.AttackSound) Effects.PlaySound(this.AttackSound, npc.Center.X | 0, npc.Center.Y | 0);
        this.HagShoot(npc, player);

        npc.localAI[0] = 0;
        npc.ai[1] = 0;
    }

    FindFrame(npc, frameHeight) {
        let index = 0;
        if (npc.velocity.Y > 0) index = 2;
        else if (npc.localAI[0] > 0) index = 1;

        const frame = npc.frame;
        frame.Y = index * frameHeight;
        npc.frame = frame;
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 15; i++) NewDust(npc.position, npc.width, npc.height, 5, 2.5 * hitDirection, -3, 0, Color.White, 1.5);
            if (this.TeleportDust >= 0) {
                for (let i = 0; i < 8; i++) NewDust(npc.position, npc.width, npc.height, this.TeleportDust, 2.5 * hitDirection, -2.5, this.DeathDustAlpha, Color.White, 1);
            }
            return;
        }

        const count = Math.min(12, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) NewDust(npc.position, npc.width, npc.height, 5, hitDirection, -1, 100, Color.White, 0.75);
    }
}
