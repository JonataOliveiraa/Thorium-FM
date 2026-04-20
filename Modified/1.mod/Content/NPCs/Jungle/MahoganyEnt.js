import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class MahoganyEnt extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 10;
    }
    
    SetDefaults() {
        this.NPC.width = 24;
        this.NPC.height = 32; 
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
        // 15% de chance de envenenar o jogador a cada acerto
        if (Math.random() < 0.15) {
            const buffType = 20; // Poisoned
            const duration = 240; // 4 segundos
            player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
        }
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.MahoganyEnt');
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    SpawnChance(info) {
        if (info.CommonEnemy && info.Player.ZoneJungle && info.SpawnTileY > Terraria.Main.worldSurface) {
            return 0.085;
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

        if (npc.velocity.Y === 0) {
            npc.velocity.X *= 0.5; 
        }
    }
    
    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;
        
        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);
            
            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;
            
            // DustID 7 = Madeira (Wood), que combina mais com um Ent!
            NewDust(
                npc.position, npc.width, npc.height,
                7, speedX, speedY, 0, Color.new(0,0,0,0), scale
            );
        }
    }
    
    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;

        const player = Terraria.Main.player[npc.target];
        let isAttacking = false;

        if (player && player.active && !player.dead) {
            const distanceX = Math.abs(npc.Center.X - player.Center.X);
            const distanceY = Math.abs(npc.Center.Y - player.Center.Y);
            
            // Distância baseada na largura/altura do Ent para garantir que só exibe quando encostar
            if (distanceX < npc.width + 20 && distanceY < npc.height + 20) {
                isAttacking = true;
            }
        }

        if (isAttacking) {
            frame.Y = frameHeight * 1; 
            npc.frame = frame;
            return;
        }

        if (npc.velocity.X === 0 && npc.velocity.Y === 0) {
            frame.Y = 0; 
            npc.frame = frame; 
            return;
        }

        if (frame.Y < frameHeight * 2) {
            frame.Y = frameHeight * 2;
        }

        npc.frameCounter += Math.abs(npc.velocity.X);
        
        if (npc.frameCounter >= 6.0) { 
            frame.Y += frameHeight; 
            npc.frameCounter = 0.0;     
        }
        
        if (frame.Y >= frameHeight * Terraria.Main.npcFrameCount[this.Type]) { 
            frame.Y = frameHeight * 2;
        }

        npc.frame = frame;
    }
}