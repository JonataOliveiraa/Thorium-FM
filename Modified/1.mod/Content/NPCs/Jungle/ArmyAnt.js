import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class ArmyAnt extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
    }
    
    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17; 
        this.NPC.aiStyle = 3; 
        this.NPC.damage = 25;
        this.NPC.defense = 10;
        this.NPC.lifeMax = 100;
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
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.ArmyAnt');
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    SpawnChance(info) {
        if (info.CommonEnemy && info.Player.ZoneJungle && info.SpawnTileY > Terraria.Main.worldSurface) {
            return 0.14;
        }
        return 0;
    }
    
    ModifyNPCLoot(npcLoot) {
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
                5, speedX, speedY, 0, Color.new(0,0,0,0), scale
            );
        }
    }
    
    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        
        let frame = npc.frame;

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            frame.Y = 0; 
            npc.frame = frame; 
            return;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);
        
        if (npc.frameCounter >= 6.0) { 
            frame.Y += frameHeight; 
            npc.frameCounter = 0.0;     
        }
        
        if (frame.Y >= frameHeight * Terraria.Main.npcFrameCount[this.Type]) { 
            frame.Y = 0;
        }

        npc.frame = frame;
    }
}