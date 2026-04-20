import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

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
        this.NPC.aiStyle = 14; // Bat AI
        this.NPC.damage = 18;
        this.NPC.defense = 4;
        this.NPC.lifeMax = 45;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath4; // Som típico de morcego morrendo
        this.NPC.value = ModNPC.NPCValue(0, 0, 1, 50);

        this.AnimationType = Terraria.ID.NPCID.CaveBat;
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.EarthenBat');
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    SpawnChance(info) {
        if (info.CommonEnemy && info.SpawnTileY > Terraria.Main.rockLayer && info.SpawnTileY < Terraria.Main.maxTilesY - 200) {
            return 0.10;
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
                0, speedX, speedY, 0, Color.new(0,0,0,255), scale
            );
        }
    }
}