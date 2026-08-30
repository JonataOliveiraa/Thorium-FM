import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class BigBone extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Dungeon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = 10;
        Terraria.ID.NPCID.Sets.Skeletons[this.Type] = true;
        this.BestiaryRarityStars = 1;
    }

    SetDefaults() {
        this.NPC.width = 34;
        this.NPC.height = 40;
        this.NPC.scale = 1.1;
        this.NPC.aiStyle = 3;
        this.NPC.damage = 30;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 140;
        this.NPC.knockBackResist = 0.2;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit2;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath2;
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 50);

        this.AIType = 31;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.TheDungeon);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.BigBone');
        bestiaryEntry.Info.Add(FlavorText);
    }

    PostAI(npc) {
        if (npc.localAI[0] > 0) npc.localAI[0]--;

        const vel = npc.velocity;
        if (vel.Y === 0 && Math.abs(vel.X) > 1) {
            vel.X = Math.sign(vel.X);
            npc.velocity = vel;
        }
    }

    OnHitPlayer(npc, player) {
        npc.localAI[0] = 22;
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;

        const frame = npc.frame;

        if (npc.localAI[0] > 0) {
            frame.Y = frameHeight;
            npc.frame = frame;
            return;
        }

        if (Math.abs(npc.velocity.X) < 0.15) {
            frame.Y = 0;
            npc.frameCounter = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);
        if (npc.frameCounter >= 6) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;
        }

        if (frame.Y < frameHeight * 2 || frame.Y > frameHeight * 9) {
            frame.Y = frameHeight * 2;
        }

        npc.frame = frame;
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || !info.Dungeon) return 0;

        return (Main.hardMode && Terraria.NPC.downedPlantBoss) ? 0.02 : 0.08;
    }

    HitEffect(npc, hitDirection, damage) {
        if (Main.netMode === 2) return;

        if (npc.life <= 0) {
            for (let i = 0; i < 15; i++) {
                NewDust(npc.position, npc.width, npc.height, 26, 2.5 * hitDirection, -2.5, 0, Color.White, 1);
            }
            return;
        }

        const count = Math.min(10, Math.floor(damage / npc.lifeMax * 50));
        for (let i = 0; i < count; i++) {
            NewDust(npc.position, npc.width, npc.height, 26, hitDirection, -1, 0, Color.White, 0.75);
        }
    }

    ModifyNPCLoot(npcLoot) {
        const notExpert = Conditions.NotExpert ? Conditions.NotExpert.new() : null;
        const isExpert = Conditions.IsExpert ? Conditions.IsExpert.new() : null;

        if (notExpert && isExpert) {
            npcLoot.Add(ItemDropRule.ByCondition(notExpert, 154, 1, 2, 4, 1));
            npcLoot.Add(ItemDropRule.ByCondition(isExpert, 154, 1, 4, 8, 1));
        } else {
            npcLoot.Add(ItemDropRule.Common(154, 1, 2, 4));
        }

        const graveGoods = ModItem.getTypeByName('GraveGoods');
        if (graveGoods > 0) npcLoot.Add(ItemDropRule.Common(graveGoods, 20, 1, 1));

        npcLoot.Add(ItemDropRule.Common(3095, 100, 1, 1));
        npcLoot.Add(ItemDropRule.Common(327, 65, 1, 1));
        npcLoot.Add(ItemDropRule.Common(932, 250, 1, 1));
        npcLoot.Add(ItemDropRule.Common(1307, 300, 1, 1));
        npcLoot.Add(ItemDropRule.Common(959, 450, 1, 1));
        }
}
