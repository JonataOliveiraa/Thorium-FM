import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Vector2 } from '../../../TL/Modules/Vector2.js';

const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class EarthenBat extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }

    SetDefaults() {
        this.NPC.width = 16;
        this.NPC.height = 16;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 18;
        this.NPC.defense = 4;
        this.NPC.lifeMax = 45;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath4; // Som típico de morcego morrendo
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 50);

        this.AnimationType = Terraria.ID.NPCID.CaveBat;
    }

    AI(npc) {
        let player = Terraria.Main.player[npc.target];
        if (npc.target < 0 || npc.target == 255 || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Terraria.Main.player[npc.target];
        }

        if (!player.active || player.dead) return;

        npc.ai[0] += 0.05;
        if (npc.ai[0] > Math.PI * 2) npc.ai[0] -= Math.PI * 2;

        let toPlayer = Vector2.Subtract(player.Center, npc.Center);
        let dist = toPlayer.Length();
        let dir = dist > 0 ? Vector2.Divide(toPlayer, dist) : Vector2.new(0, -1);

        npc.localAI[0]--;
        if (npc.localAI[0] <= 0) {
            npc.localAI[0] = 20 + Math.random() * 20;       // reseta o temporizador
            npc.localAI[1] = (Math.random() - 0.5) * 0.4;   // guarda o ângulo aleatório
        }

        let cosA = Math.cos(npc.localAI[1]);
        let sinA = Math.sin(npc.localAI[1]);
        dir = Vector2.new(
            dir.X * cosA - dir.Y * sinA,
            dir.X * sinA + dir.Y * cosA
        );

        let perpX = -dir.Y;
        let perpY = dir.X;
        let oscStrength = 3.5;
        let sine = Math.sin(npc.ai[0]);
        let sidewaysX = perpX * sine * oscStrength;
        let sidewaysY = perpY * sine * oscStrength;

        const speed = 3.5;
        const accel = 0.8;
        let desiredX = dir.X * speed + sidewaysX;
        let desiredY = dir.Y * speed + sidewaysY;

        let velX = npc.velocity.X * (1 - accel) + desiredX * accel;
        let velY = npc.velocity.Y * (1 - accel) + desiredY * accel;

        const maxSpeedLimit = speed + (oscStrength * 0.6);
        let sqrMag = velX * velX + velY * velY;
        if (sqrMag > maxSpeedLimit * maxSpeedLimit) {
            let scale = maxSpeedLimit / Math.sqrt(sqrMag);
            velX *= scale;
            velY *= scale;
        }

        // Ruído aleatório
        velX += (Math.random() - 0.5) * 0.3;
        velY += (Math.random() - 0.5) * 0.3;

        npc.velocity = Vector2.new(velX, velY);

        // Zona morta para evitar flicker
        if (Math.abs(velX) > 0.4) {
            npc.direction = velX > 0 ? 1 : -1;
        }
        npc.spriteDirection = npc.direction;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.EarthenBat');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.SpawnTileY > Terraria.Main.rockLayer && info.Underground && info.SpawnTileY < Terraria.Main.maxTilesY - 200 && !info.Water) {
            return 0.05;
        }
        return 0;
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);

            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;

            // DustID 0 = Terra (Dirt)
            NewDust(
                npc.position, npc.width, npc.height,
                0, speedX, speedY, 0, Color.new(0, 0, 0, 255), scale
            );
        }
    }
}