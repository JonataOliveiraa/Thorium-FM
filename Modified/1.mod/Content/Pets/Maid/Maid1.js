import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { GroundPetProjectile } from '../GroundPetProjectile.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const SPRITE_NONE = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';

const FRAMES = 18;

const BOW_DELAY = 300;
const BOW_LAST_FRAME = 17;
const BOW_HOLD_FRAME = BOW_LAST_FRAME - 3;
const BOW_SLOW_RATE = 12;
const BOW_RATE = 6;

export class Maid1 extends GroundPetProjectile {
    get BuffName() {
        return 'MaidBuff';
    }

    get FlyAccel() {
        return 0.2;
    }

    get IdleFrame() {
        return 11;
    }

    get FallFrame() {
        return 2;
    }

    get WalkFrameMin() {
        return 1;
    }

    get WalkFrameMax() {
        return 6;
    }

    get FlyFrameMin() {
        return 7;
    }

    get FlyFrameMax() {
        return 10;
    }

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.EffectPath = 'Textures/' + this.Texture + '_Effect.png';
        this.bowTimer = 0;
        this.mirrorTexture = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Main.projPet[this.Type] = true;

        try {
            if (tl.file.exists(this.EffectPath)) this.mirrorTexture = tl.texture.load(this.EffectPath);
        } catch (e) {
            this.mirrorTexture = null;
        }

        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            this.WalkFrameMin, this.WalkFrameMax + 1 - this.WalkFrameMin,
            6, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -7, 0
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        super.SetDefaults();
        this.Projectile.width = 30;
        this.Projectile.height = 37;
    }

    WalkEffects(proj) {
        this.bowTimer = 0;
    }

    IdleFrames(proj) {
        if (proj.frame < this.IdleFrame) {
            proj.frameCounter += 2;
            if (proj.frameCounter > BOW_RATE) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= this.WalkFrameMax) proj.frame = this.IdleFrame;
            return;
        }

        this.bowTimer++;
        if (this.bowTimer < BOW_DELAY) {
            proj.frame = this.IdleFrame;
            proj.frameCounter = 0;
            return;
        }

        proj.frameCounter++;
        const rate = proj.frame === BOW_HOLD_FRAME ? BOW_SLOW_RATE : BOW_RATE;
        if (proj.frameCounter > rate) {
            proj.frame++;
            if (proj.frame >= BOW_LAST_FRAME) proj.frame = BOW_LAST_FRAME;
            proj.frameCounter = 0;
        }
    }

    PreDraw(proj, lightColor) {
        if (proj.spriteDirection <= 0 || !this.mirrorTexture) return true;

        const frameHeight = (this.mirrorTexture.Height / FRAMES) | 0;
        const source = Modules.Rectangle.new(0, proj.frame * frameHeight, this.mirrorTexture.Width, frameHeight);
        const origin = Vector2.new(this.mirrorTexture.Width * 0.5, frameHeight * 0.5);
        const pos = Vector2.new(
            proj.Center.X - Main.screenPosition.X,
            proj.Center.Y - Main.screenPosition.Y + proj.gfxOffY
        );

        Main[ENTITY_DRAW](
            this.mirrorTexture, pos, source, lightColor,
            proj.rotation, origin, proj.scale, SPRITE_NONE, 0
        );

        return false;
    }
}
