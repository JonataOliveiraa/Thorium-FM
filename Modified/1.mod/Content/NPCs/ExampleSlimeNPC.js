import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModNPC } from './../../TL/ModNPC.js';
import { ModItem } from './../../TL/ModItem.js';
import { ModBiome } from './../../TL/ModBiome.js';
import { ModLocalization } from './../../TL/ModLocalization.js';

const { Color } = Modules;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const { 
    BestiaryDatabaseNPCsPopulator,
    FlavorTextBestiaryInfoElement
} = Terraria.GameContent.Bestiary;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class ExampleSlimeNPC extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 2;
        Terraria.Main.slimeRainNPC[this.Type] = true;
        Terraria.ID.NPCID.Sets.ShimmerTransformToNPC[this.Type] = Terraria.ID.NPCID.ShimmerSlime;
    }
    
    SetDefaults() {
        this.NPC.aiStyle = Terraria.ID.NPCAIStyleID.Slime;
        this.NPC.damage = 7;
        this.NPC.defense = 2;
        this.NPC.lifeMax = 25;
        this.NPC.alpha = 175;
        this.NPC.color = Color.new(40, 200, 255, 100);
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 25);
        
        this.AnimationType = 1;
    }
    
    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
        npc.buffImmune[31] = false;
    }
    
    SetBestiary(database, bestiaryEntry) {
        // Surface Biome and DayTime
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Surface);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Times.DayTime);
        // Displays a sun in the background of the bestiary entry
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Visuals.Sun);
        
        // Sets the description of this NPC that is listed in the bestiary
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.ExampleSlimeNPC');
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    // Sets the spawn chance for this NPC
    SpawnChance(info) {
        // Only spawns in ExampleBiome
        // see: Content/Biomes/ExampleBiome.js
        if (!ModBiome.getByName('ExampleSurfaceBiome')?.IsActive) {
            return 0;
        }
        
        if (!info.CommonEnemy) {
            return 0;
        }
        
        let chance = 0;
        
        if (info.Day && info.AboveSurface) {
            if (info.Rain) chance = 0.05;
            else chance = 0.1;
            
            if (info.HardMode) chance += 0.05;
        }
        
        return chance;
    }
    
    ModifyNPCLoot(npcLoot) {
        // Drop 1-2 Gel (100/1 - 100% chance);
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Gel, 1, 1, 2));
        // Drop 5-10 ExampleItem (100/3 - 33.33% chance);
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('ExampleItem'), 3, 5, 10));
        // Drop Slime Staff (100/10000 - 0.01% chance || 100/7000 - 0.0143% chance in expert)
        npcLoot.Add(ItemDropRule.NormalvsExpert(Terraria.ID.ItemID.SlimeStaff, 10000, 7000));
    }
    
    ModifyItemDropFromNPC(npc, itemIndex) {
        const item = Terraria.Main.item[itemIndex];
        if (item?.type === Terraria.ID.ItemID.Gel) {
            item.color = this.NPC.color;
        }
    }
    
    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        let flag = false;
        
        if (npc.life <= 0) {
            flag = true;
        }
        
        const count = flag ? 45 : 10;
        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = 1;
            
            if (flag) {
                speedX = (Math.random() - 0.5) * 2 * hitDirection;
                scale = 1 + (Math.random() - 0.5);
            } else {
                scale = 0.6 + (Math.random() - 0.5);
            }
            
            NewDust(
                npc.position, npc.width, npc.height,
                Terraria.ID.DustID.TintableDust,
                speedX, speedY,
                50 + Math.floor(Math.random() * 50),
                npc.color, scale
            );
        }
    }
    
    // Copied from AnimationType = 1;
    /*FindFrame(npc, frameHeight) {
        let frame = npc.frame;
        let num2 = 0;
        
        if (npc.aiAction == 0) num2 = npc.velocity.Y >= 0.0 ? (npc.velocity.Y <= 0.0 ? (npc.velocity.X == 0.0 ? 0 : 1) : 3) : 2;
        else if (npc.aiAction == 1) num2 = 4;
        
        ++npc.frameCounter;
        if (num2 > 0) ++npc.frameCounter;
        if (num2 == 4) ++npc.frameCounter;
        
        if (npc.frameCounter >= 8.0) {
            frame.Y += frameHeight;
            npc.frameCounter = 0.0;
        }
        
        if (frame.Y >= frameHeight * Terraria.Main.npcFrameCount[this.Type]) frame.Y = 0;
        
        npc.frame = frame;
    }*/
}