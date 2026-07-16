import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GraveLimb extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/BloodMoon/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 3;
    }

    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17;
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Fighter;
        this.NPC.damage = 10;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 15;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = 20;
        const duration = 240;
        player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.BloodMoon) {
            return 0.20;
        }
        return 0;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Events.BloodMoon);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GraveLimb');
        bestiaryEntry.Info.Add(FlavorText);
    }


    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('Blood'), 5, 2, 4));
    }


    PostAI(npc) {
        npc.TargetClosest(true);

        const player = Terraria.Main.player[npc.target];
        if (player && player.active && !player.dead) {
            npc.direction = (player.Center.X < npc.Center.X) ? -1 : 1;
        }

        let vel = npc.velocity;

        if (vel.Y === 0) {
            vel.X += npc.direction * 0.5;

            if (Math.abs(vel.X) > 6.0) {
                vel.X = 6.0 * npc.direction;
            }
        }

        npc.velocity = vel;
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;

        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);

            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;

            NewDust(
                npc.position, npc.width, npc.height,
                5, speedX, speedY, 0, Color.new(0, 0, 0, 0), scale
            );
        }
    }

    FindFrame(npc, frameHeight) {
        let frame = npc.frame;
        let startFrame = 0;
        let finalFrame = 1;

        const secondStage = npc.ai[0] == 1;

        if (secondStage) {
            startFrame = 2;
            finalFrame = Terraria.Main.npcFrameCount[this.Type] - 1;

            if (frame.Y < startFrame * frameHeight) {
                // If we were animating the first stage frames and then switch to second stage, immediately change to the start frame of the second stage
                frame.Y = startFrame * frameHeight;
            }
        }

        let frameSpeed = 5;
        npc.frameCounter += 0.5;
        npc.frameCounter += npc.velocity.Length() / 10.0; // Make the counter go faster with more movement speed
        if (npc.frameCounter > frameSpeed) {
            npc.frameCounter = 0;
            frame.Y += frameHeight;

            if (frame.Y > finalFrame * frameHeight) {
                frame.Y = startFrame * frameHeight;
            }
        }

        // This is necessary to update the NPC frame
        npc.frame = frame;
    }
}