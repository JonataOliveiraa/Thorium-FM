import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { Effects } from '../../../TL/Modules/Effects.js';

const { Color, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const SPRITE_NONE = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
        
const FRAMES = 4;
const FRAME_RATE = 16;

const BUBBLE_FRAMES = 4;
const BUBBLE_FRAME_RATE = 22;
const BUBBLE_SCALE = 1.1;
const BUBBLE_TINT = 0.25;
const BUBBLE_ALPHA = 100;

const HOVER_X = 30;
const HOVER_Y = -40;

const LIGHT_R = 0.45;
const LIGHT_G = 0.6;
const LIGHT_B = 0.7;
const LIGHT_WET_BONUS = 0.4;

export class AnglerBowlPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.BubblePath = 'Textures/' + this.Texture + '_Bubble.png';
        this.bubbleTexture = null;
        this.buffType = 0;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Main.projPet[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.LightPet[this.Type] = true;

        try {
            if (tl.file.exists(this.BubblePath)) this.bubbleTexture = tl.texture.load(this.BubblePath);
        } catch (e) {
            this.bubbleTexture = null;
        }
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.penetrate = -1;
        this.Projectile.netImportant = true;
        this.Projectile.timeLeft = 18000;
        this.Projectile.extraUpdates = 2;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('AnglerBowlBuff');

        const player = Main.player[proj.owner];
        if (!player.active) {
            proj.active = false;
            return;
        }
        if (!player.dead && this.buffType && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        proj.position = Vector2.new(
            player.Center.X - proj.width / 2 + HOVER_X * player.direction,
            player.Center.Y + HOVER_Y
        );
        proj.gfxOffY = player.gfxOffY;
        proj.direction = -player.direction;
        proj.spriteDirection = -proj.direction;

        const bonus = player.wet ? LIGHT_WET_BONUS : 0;
        Effects.AddLight(proj.Center, LIGHT_R + bonus, LIGHT_G + bonus, LIGHT_B + bonus);

        this.Animate(proj);
    }

    Animate(proj) {
        const local = new ProjAI(proj, true);

        const bubbleCounter = local[0] + 1;
        if (bubbleCounter > BUBBLE_FRAME_RATE) {
            local[0] = 0;
            local[1] = (local[1] + 1) % BUBBLE_FRAMES;
        } else {
            local[0] = bubbleCounter;
        }

        let frame = proj.frame;
        let counter = proj.frameCounter + 1;
        if (counter > FRAME_RATE) {
            frame++;
            counter = 0;
        }
        if (frame >= FRAMES) frame = 0;

        proj.frame = frame;
        proj.frameCounter = counter;
    }

    PostDraw(proj, lightColor) {
        if (proj.wet || !this.bubbleTexture) return;

        const local = new ProjAI(proj, true);
        const frameHeight = (this.bubbleTexture.Height / BUBBLE_FRAMES) | 0;
        const source = Rectangle.new(0, (local[1] | 0) * frameHeight, this.bubbleTexture.Width, frameHeight);
        const origin = Vector2.new(this.bubbleTexture.Width * 0.5, frameHeight * 0.5);
        const pos = Vector2.new(
            proj.Center.X - Main.screenPosition.X,
            proj.Center.Y + proj.gfxOffY - Main.screenPosition.Y
        );

        Main[ENTITY_DRAW](
            this.bubbleTexture, pos, source,
            Color.Multiply(Color.new(255, 255, 255, BUBBLE_ALPHA), BUBBLE_TINT),
            proj.rotation, origin, BUBBLE_SCALE, SPRITE_NONE, 0
        );
    }
}
