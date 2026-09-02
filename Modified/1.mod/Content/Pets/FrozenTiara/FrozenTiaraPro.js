import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { GroundPetProjectile } from '../GroundPetProjectile.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const SPRITE_NONE = Microsoft.Xna.Framework.Graphics.SpriteEffects.None;
const SPRITE_FLIP = Microsoft.Xna.Framework.Graphics.SpriteEffects.FlipHorizontally;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FRAMES = 6;

const DUST_FLY = 92;
const DUST_WALK = 16;
const DUST_BOX = 8;
const DUST_DRIFT = 0.5;
const DUST_DAMPEN = 0.2;

const BLINK_HOLD = 5;
const BLINK_PAUSE_MIN = -180;
const BLINK_PAUSE_MAX = -10;

export class FrozenTiaraPro extends GroundPetProjectile {
    get BuffName() {
        return 'FrozenTiaraBuff';
    }

    get IdleFrame() {
        return 0;
    }

    get FallFrame() {
        return 4;
    }

    get WalkFrameMin() {
        return 0;
    }

    get WalkFrameMax() {
        return 2;
    }

    get FlyFrameMin() {
        return 4;
    }

    get FlyFrameMax() {
        return 5;
    }

    get FlyFrameRate() {
        return 1;
    }

    get WalkFrameRate() {
        return 14;
    }

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.EffectPath = 'Textures/' + this.Texture + '_Effect.png';
        this.blinkTexture = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Main.projPet[this.Type] = true;

        try {
            if (tl.file.exists(this.EffectPath)) this.blinkTexture = tl.texture.load(this.EffectPath);
        } catch (e) {
            this.blinkTexture = null;
        }

        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            this.WalkFrameMin, this.WalkFrameMax + 1 - this.WalkFrameMin,
            8, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            0, 0
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        super.SetDefaults();
        this.Projectile.width = 34;
        this.Projectile.height = 38;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        ai[2] = ai[2] + 1;
        if (ai[2] > BLINK_HOLD) ai[2] = Rand.Next(BLINK_PAUSE_MIN, BLINK_PAUSE_MAX);

        super.AI(proj);
    }

    FlyEffects(proj) {
        this.Puff(proj, DUST_FLY, 1.5, 75, proj.velocity.Y * DUST_DRIFT, proj.height / 2 - 4);
    }

    WalkEffects(proj) {
        this.Puff(proj, DUST_WALK, 2, 175, proj.velocity.Y * DUST_DRIFT, proj.height - 4);
    }

    Puff(proj, type, scale, alpha, speedY, offsetY) {
        const spawn = Vector2.new(
            proj.position.X + proj.width / 2 - 4 - proj.velocity.X,
            proj.position.Y + offsetY - proj.velocity.Y
        );

        const dust = NewDustDirect(
            spawn, DUST_BOX, DUST_BOX, type,
            -proj.velocity.X * DUST_DRIFT, speedY,
            alpha, Color.Transparent, scale
        );
        if (!dust) return;

        dust.velocity = Vector2.new(dust.velocity.X * DUST_DAMPEN, dust.velocity.Y * DUST_DAMPEN);
        dust.noGravity = true;
    }

    PostDraw(proj, lightColor) {
        if (!this.blinkTexture) return;

        const ai = new ProjAI(proj, false);
        if (ai[2] <= 0) return;

        const frameHeight = (this.blinkTexture.Height / FRAMES) | 0;
        const source = Modules.Rectangle.new(0, proj.frame * frameHeight, this.blinkTexture.Width, frameHeight);
        const origin = Vector2.new(this.blinkTexture.Width * 0.5, frameHeight * 0.5);
        const pos = Vector2.new(
            proj.Center.X - Main.screenPosition.X,
            proj.Center.Y - Main.screenPosition.Y + proj.gfxOffY
        );

        Main[ENTITY_DRAW](
            this.blinkTexture, pos, source,
            proj['Color GetAlpha(Color newColor)'](lightColor),
            proj.rotation, origin, proj.scale,
            proj.spriteDirection === 1 ? SPRITE_FLIP : SPRITE_NONE, 0
        );
    }
}
