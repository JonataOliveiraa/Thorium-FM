import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { ModSystem } from '../../../TL/ModSystem.js';

const { Main } = Terraria
const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class LivingHemorrage extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Crimson/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 4;
    }

    SetDefaults() {
        this.NPC.width = 16;
        this.NPC.height = 16;
        this.NPC.aiStyle = 14;
        this.NPC.damage = 20;
        this.NPC.defense = 6;
        this.NPC.color = Color.Red;
        this.NPC.lifeMax = 60;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 50);
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.LivingHemorrage');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.Player.ZoneCrimson && info.SpawnTileY > Terraria.Main.worldSurface) {
            return 0.06;
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


    OnKill(npc) {
        const player = Main.player[npc.target];
        const centerX = npc.Center.X;
        const centerY = npc.Center.Y;

        Terraria.NPC.NewNPC(
            Terraria.Projectile.GetNoneSource(),
            centerX,
            centerY,
            ModNPC.getTypeByName('Clot'),
            0, 0, 0, 0, 0, player.whoAmI
        );
    }


    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;
        let startFrame = 0;
        let finalFrame = 3;

        const secondStage = npc.ai[0] == 1;

        if (secondStage) {
            startFrame = 4;
            finalFrame = Terraria.Main.npcFrameCount[this.Type] - 1;

            if (frame.Y < startFrame * frameHeight) {
                frame.Y = startFrame * frameHeight;
            }
        }

        let frameSpeed = 5;
        npc.frameCounter += 0.5;
        npc.frameCounter += npc.velocity.Length() / 10.0;
        if (npc.frameCounter > frameSpeed) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;

            if (frame.Y > finalFrame * frameHeight) {
                frame.Y = startFrame * frameHeight;
            }
        }

        npc.frame = frame;
    }
}