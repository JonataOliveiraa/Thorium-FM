import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Vector2 } from '../../../TL/Modules/Vector2.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class GildedBat extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 4;
        Terraria.ID.NPCID.Sets.TrailCacheLength[this.Type] = 8;
        Terraria.ID.NPCID.Sets.TrailingMode[this.Type] = 1;
    }
    
    SetDefaults() {
        this.NPC.width = 40;
        this.NPC.height = 22; 
        this.NPC.aiStyle = 14; 
        this.NPC.damage = 20;
        this.NPC.defense = 6;
        this.NPC.lifeMax = 50;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath4;
        this.NPC.value = ModNPC.NPCValue(0, 1, 0, 0); 
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.GildedBat');
        bestiaryEntry.Info.Add(FlavorText);
    }

    PostAI(npc) {
        if (Math.random() < 0.15) {
            NewDust(npc.position, npc.width, npc.height, 43, 0, 0, 0, Color.Gold, 1.2);
        }
        Effects.AddLight(npc.Center, 1, 0.84, 0);
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 30 : 10;
        
        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);
            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;
            
            NewDust(npc.position, npc.width, npc.height, 43, speedX, speedY, 0, Color.Gold, scale);
        }
    }
    
    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;
        
        npc.frameCounter += 1.0; 
        if (npc.frameCounter >= 4.0) { 
            frame.Y += frameHeight; 
            npc.frameCounter = 0.0;     
        }
        
        if (frame.Y >= frameHeight * 4) { 
            frame.Y = 0;
        }
        
        npc.frame = frame;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        const texture = Terraria.GameContent.TextureAssets.Npc[this.Type].Value;
        
        const frameHeight = texture.Height / 4;
        const drawOrigin = Vector2.new(texture.Width / 2, frameHeight / 2); // ← corrigido

        const spriteEffects = npc.spriteDirection === 1 ? 
            Microsoft.Xna.Framework.Graphics.SpriteEffects.FlipHorizontally : 
            Microsoft.Xna.Framework.Graphics.SpriteEffects.None;

        for (let k = npc.oldPos.length - 1; k > 0; k--) {
            if (npc.oldPos[k].X === 0 && npc.oldPos[k].Y === 0) continue;
            
            let drawPos = Vector2.Subtract(npc.oldPos[k], Terraria.Main.screenPosition);
            drawPos = Vector2.Add(drawPos, Vector2.new(npc.width / 2, npc.height / 2));

            const alpha = 0.60 * (1 - k / npc.oldPos.length);
            const color = Color.Lerp(Color.Transparent, Color.Gold, alpha);
            const scale = npc.scale + 0.1;

            Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
                texture, 
                drawPos, 
                npc.frame, 
                color, 
                npc.rotation, 
                drawOrigin, 
                scale, 
                spriteEffects, 
                0
            );
        }
        return false; 
    }
}