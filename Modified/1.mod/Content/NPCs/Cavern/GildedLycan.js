import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const SpriteSortMode = new NativeClass('Microsoft.Xna.Framework.Graphics', 'SpriteSortMode');
const BlendState = new NativeClass('Microsoft.Xna.Framework.Graphics', 'BlendState');
const DepthStencilState = new NativeClass('Microsoft.Xna.Framework.Graphics', 'DepthStencilState');

export class GildedLycan extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 10;
    }

    SetDefaults() {
        this.NPC.width = 32;
        this.NPC.height = 48;
        this.NPC.aiStyle = 3;
        this.NPC.damage = 40;
        this.NPC.defense = 15;
        this.NPC.lifeMax = 200;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath1;
        this.NPC.value = ModNPC.NPCValue(0, 0, 10, 0);
        this.NPC.knockBackResist = 0.5;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.Lycan');
        bestiaryEntry.Info.Add(FlavorText);
    }

    SpawnChance(info) {
        if (info.CommonEnemy && info.SpawnTileY > Terraria.Main.rockLayer && info.SpawnTileY < Terraria.Main.maxTilesY - 200) {
            return 0.03;
        }
        return 0;
    }

    FindFrame(npc, frameHeight) {
        npc.spriteDirection = npc.direction;
        let frame = npc.frame;

        const isIdle = Math.abs(npc.velocity.X) < 0.1 && Math.abs(npc.velocity.Y) < 0.5;
        const isAttacking = npc.localAI[0] > 0; // Agora checamos se o timer está rodando

        if (isAttacking) {
            frame.Y = frameHeight;
            npc.frame = frame;
            return;
        }

        if (isIdle) {
            frame.Y = 0; // frame 1
            npc.frameCounter = 0;
            npc.frame = frame;
            return;
        }

        npc.frameCounter++;
        if (npc.frameCounter >= 5) {
            frame.Y += frameHeight;
            npc.frameCounter = 0;
        }

        if (frame.Y < frameHeight * 2) frame.Y = frameHeight * 2;
        if (frame.Y >= frameHeight * 10) frame.Y = frameHeight * 2;

        npc.frame = frame;
    }

    PostAI(npc) {
        npc.TargetClosest(true);

        const enraged = npc.life <= npc.lifeMax * 0.5;

        const player = Terraria.Main.player[npc.target];
        if (player && player.active && !player.dead) {
            npc.direction = (player.Center.X < npc.Center.X) ? -1 : 1;
        }

        if (npc.localAI[0] > 0) {
            npc.localAI[0]--;
        }

        let vel = npc.velocity;

        if (vel.Y === 0) {
            if (enraged) {
                vel.X += npc.direction * 0.9;
                if (Math.abs(vel.X) > 10.0) {
                    vel.X = 10.0 * npc.direction;
                }
            } else {
                vel.X += npc.direction * 0.5;
                if (Math.abs(vel.X) > 6.0) {
                    vel.X = 6.0 * npc.direction;
                }
            }
        }

        npc.velocity = vel;

        if (enraged) {
            if (Math.random() < 0.20) {
                NewDust(npc.position, npc.width, npc.height, 43, 0, 0, 0, Color.Gold, 1.5);
            }
            Effects.AddLight(npc.Center, 1, 0.84, 0);
        }
    }

    OnHitPlayer(npc, player, damageSource, damage, hitDirection, pvp, quiet, crit, cooldownCounter, dodgeable) {
        npc.localAI[0] = 20;
    }

    HitEffect(npc, hitDirection, damage) {
        let speedX = hitDirection * 0.3;
        const flag = npc.life <= 0;
        const count = flag ? 40 : 10;
        for (let i = 0; i < count; i++) {
            let speedY = (Math.random() - 0.5) * 2;
            let scale = flag ? 1 + (Math.random() - 0.5) : 0.6 + (Math.random() - 0.5);
            if (flag) speedX = (Math.random() - 0.5) * 2 * hitDirection;
            NewDust(npc.position, npc.width, npc.height, 43, speedX, speedY, 0, Color.Gold, scale);
        }
    }

    PostDraw(npc, spriteBatch, screenPos) {
        if (npc.life > npc.lifeMax * 0.5) return;

        const texture = tl.texture.load('Textures/NPCs/Cavern/GildedLycan_Glow.png');
        if (!texture) return;

        const drawPos = Vector2.Subtract(npc.Center, screenPos);
        drawPos.Y += npc.gfxOffY;

        const origin = Vector2.new(
            texture.Width / 2,
            (texture.Height / Terraria.Main.npcFrameCount[this.Type]) / 2
        );
        const spriteDir = npc.spriteDirection === 1 ? SpriteEffects.FlipHorizontally : SpriteEffects.None;

        spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
            texture, drawPos, npc.frame, Color.Red, npc.rotation, origin, npc.scale, spriteDir, 0
        );
    }
}