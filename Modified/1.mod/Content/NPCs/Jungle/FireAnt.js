import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Effects } from '../../../TL/Modules/Effects.js';
import { Rand } from '../../../TL/Modules/Rand.js';

const { Color, Vector2 } = Modules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class FireAnt extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Jungle/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 5;
        this.trailScaleDecay = 0.030;
        this.trailAlpha = 0.75;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 8;
		Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 1;
    }
    
    SetDefaults() {
        this.NPC.width = 35;
        this.NPC.height = 17; 
        this.NPC.aiStyle = 3; 
        this.NPC.damage = 35;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 140;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 1, 0, 0);
    }
    
    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true; 
    }

    OnHitPlayer(npc, player, target, damage, crit) {
        const buffType = 24;
        const duration = 120;
        player['void AddBuff(int type, int time, bool fromNetPvP)'](buffType, duration, false);
    }
    
    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Jungle);
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Underground);
        
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.FireAnt');
        bestiaryEntry.Info.Add(FlavorText);
    }
    
    SpawnChance(info) {
        if (info.CommonEnemy && info.Player.ZoneJungle && info.SpawnTileY > Terraria.Main.worldSurface) {
            return 0.04;
        }
        return 0;
    }

    PreDraw(proj) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, texture.Height * 0.5);
        const effects = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;
        for (let k = proj.oldPos.Length - 1; k > 0; k--) {
            let drawPos = Vector2.Subtract(proj.oldPos.get_Item(k), Terraria.Main.screenPosition);
            drawPos = Vector2.Add(drawPos, Vector2.new(drawOrigin.X, drawOrigin.Y + proj.gfxOffY));
            const alpha = this.trailAlpha * (1 - k / proj.oldPos.Length);
            const color = Color.Lerp(Color.Transparent, Color.Orange, alpha);
            const scale = Math.max(proj.scale - k * this.trailScaleDecay);
            Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'
            ](texture, drawPos, null, color, proj.rotation, drawOrigin, scale, effects, 0);
        }
        return true;
    }

    PostAI(npc) {
        npc.TargetClosest(true);
        
        const player = Terraria.Main.player[npc.target];
        if (player && player.active && !player.dead) {
            npc.direction = (player.Center.X < npc.Center.X) ? -1 : 1;
        }

        let vel = npc.velocity;
        
        if (vel.Y === 0) {
            vel.X += npc.direction * 0.7;
            
            if (Math.abs(vel.X) > 6.0) {
                vel.X = 6.0 * npc.direction;
            }
        }

        Effects.AddLight(npc.Center, 0.945, 0.392, 0.122)

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