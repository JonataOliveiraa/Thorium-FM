import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class BatOutaHell extends ModNPC {
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
        this.NPC.defense = 1;
        this.NPC.lifeMax = 20;
        this.NPC.noTileCollide = true
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath4; // Som típico de morcego morrendo
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 30);

        this.AnimationType = Terraria.ID.NPCID.CaveBat;
        this.AIType = Terraria.ID.NPCID.CaveBat
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[31] = true;
        npc.buffImmune[24] = true;
    }
    
    PostAI(npc) {
        Effects.AddLight(npc.Center, 0.0945, 0.0392, 0.0122)
    }

    OnHitPlayer(npc, player) {
        player.AddBuff(Terraria.ID.BuffID.OnFire, 180, false)

        if(Math.random() > 5) return
        player.AddBuff(Terraria.ID.BuffID.BrokenArmor, 180, false)
    }
}