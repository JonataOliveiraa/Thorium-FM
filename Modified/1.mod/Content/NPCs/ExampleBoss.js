import { Terraria, Modules } from './../../TL/ModImports.js';
import { WorldDB } from './../../TL/WorldDB.js';
import { ModNPC } from './../../TL/ModNPC.js';
import { ModItem } from './../../TL/ModItem.js';
import { ModLocalization } from './../../TL/ModLocalization.js';
import { ModGore } from './../../TL/ModGore.js';

const { Color, Vector2 } = Modules;
const { ItemDropRule, LeadingConditionRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { 
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement,
    MoonLordPortraitBackgroundProviderBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];

export class ExampleBoss extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/ExampleBoss/' + this.constructor.name;
    }
    
    DeathMessage = (npc) => {
        return Terraria.Localization.Language.GetText('Announcement.HasBeenDefeated_Single'
        ).Value.replace('{0}', ModLocalization.Translate('NPCName.ExampleBoss'));
    }
    
    BossHeadSlot(npc) {
        if (npc.ai[0] == 1) {
            return 1 + Terraria.ID.NPCID.Sets.BossHeadTextures[npc.type];
        }
        return null;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 6;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        Terraria.ID.NPCID.Sets.BossBestiaryPriority.Add(this.Type);
        
        this.BestiaryRarityStars = 2;
        
        this.Music = Terraria.ID.MusicID.OtherworldlyLunarBoss;
    }
    
    SetDefaults() {
        this.NPC.width = 110;
        this.NPC.height = 110;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 12;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 2000;
        this.NPC.knockBackResist = 0.0;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.boss = true;
        this.NPC.npcSlots = 10;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 3, 0, 0);
    }
    
    SetBestiary(database, bestiaryEntry) {
        // Plain black background
        bestiaryEntry.Info.Add(MoonLordPortraitBackgroundProviderBestiaryInfoElement.new());
        
        // Sets the description of this NPC that is listed in the bestiary
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate(`Bestiary.${this.constructor.name}`);
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    ModifyNPCLoot(npcLoot) {
        // Do NOT misuse the ModifyNPCLoot and OnKill hooks: the former is only used for registering drops, the latter for everything else
        
        // The order in which you add loot will appear as such in the Bestiary. To mirror vanilla boss order:
        // 1. Trophy
        // 2. Classic Mode ("not expert")
        // 3. Expert Mode (usually just the treasure bag)
        // 4. Master Mode (relic first, pet last, everything else in between)
        
        // Normal Drops (Not Expert)
        const notExpert = Conditions.NotExpert.new();
        npcLoot.Add(ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('ExampleBossMask'), 7, 1, 1, 1));
        npcLoot.Add(ItemDropRule.ByCondition(notExpert, ModItem.getTypeByName('ExampleItem'), 1, 15, 30, 1));
        
        // BossBag (Expert / Master)
        // The boss bag should drop the same drops as before except the trophy
        // This should be done in the '<ModItem>.OpenBossBag()' method
        npcLoot.Add(ItemDropRule.BossBag(ModItem.getTypeByName('ExampleBossBag')));
    }
    
    OnKill(npc) {
        // Check if the boss has already been defeated
        if (!WorldDB.get('downedExampleBoss')) {
            // Sets the `downedExampleBoss` flag to true, which can be used later to check if the boss has already been defeated in this world
            WorldDB.set('downedExampleBoss', true);
            // Triggers the LanternNight event the first time the boss is defeated
            Terraria.GameContent.Events.LanternNight.NextNightIsLanternNight = true;
        }
    }
    
    BossLoot(npc, potionType) {
        // Here you'd want to change the potion type that drops when the boss is defeated. Because this boss is early pre-hardmode, we keep it unchanged
        // (Lesser Healing Potion). If you wanted to change it, simply write "potionType = ItemID.HealingPotion;" or any other potion type
        return potionType;
    }
    
    FindFrame(npc, frameHeight) {
        let frame = npc.frame;
        let startFrame = 0;
        let finalFrame = 2;
        
        const secondStage = npc.ai[0] == 1;
        
        if (secondStage) {
            startFrame = 3;
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
    
    HitEffect(npc, hitDirection, damage) {
        if (Terraria.Main.netMode > 0) {
            return;
        }
        
        if (npc.life <= 0) {
            // Front
            NewGore(
                npc.Right,
                Vector2.new(
                    Math.random() * 5,
                    1 + Math.random() * 5
                ),
                ModGore.getTypeByName(`${this.constructor.name}_GoreFront`),
                1.5
            );
            // Back
            NewGore(
                npc.Left,
                Vector2.new(
                    Math.random() * -5,
                    1 + Math.random() * 5
                ),
                ModGore.getTypeByName(`${this.constructor.name}_GoreBack`),
                1.5
            );
        }
    }
    
    PreAI(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        return true;
    }
    
    AI(npc) {
        if (npc.target < 0 || npc.target == 255 || Terraria.Main.player[npc.target].dead || !Terraria.Main.player[npc.target].active) {
            npc.TargetClosest(true);
        }
        
        const player = Terraria.Main.player[npc.target];
        
        if (player.dead || Terraria.Main.dayTime) {
            npc.velocity = Vector2.new(npc.velocity.X, npc.velocity.Y - 0.4)
            npc.EncourageDespawn(10);
        }
        
        const secondStage = npc.life <= npc.lifeMax * 0.5;
        if (secondStage && npc.ai[0] != 1) {
            npc.ai[0] = 1;
        }
        
        const toPlayer = Vector2.Subtract(player.Center, npc.Center);
        const toPlayerNormalized = Vector2.Normalize(toPlayer);
        const offsetX = 200;
        
        let changeDirOffset = offsetX * 0.7;
        
        if ((npc.direction == -1 && npc.Center.X - changeDirOffset < toPlayer.X) || (npc.direction == 1 && npc.Center.X + changeDirOffset > toPlayer.X)) {
            npc.direction *= -1;
        }
        
        let speed = 12, inertia = 80;
        
        if (npc.Top.Y > player.Bottom.Y) {
            speed += 4;
            inertia += 20;
        }
        
        if (secondStage) {
            speed *= 2;
            inertia *= 2;
        }
        
        const moveTo = Vector2.Multiply(
            toPlayerNormalized,
            Vector2.new(speed, speed)
        );
        
        npc.velocity = Vector2.Divide(
            Vector2.Add(
                Vector2.Multiply(
                    npc.velocity,
                    Vector2.new(inertia - 1, inertia - 1)
                ),
                moveTo
            ),
            Vector2.new(inertia, inertia)
        );
        
        npc.rotation = Math.atan2(toPlayer.Y, toPlayer.X) + Math.PI * 1.5;
    }
}