import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Vector2, Rand, Effects, Rectangle } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const FRAME_COUNT = 6;
const MAX_STORAGE = 1000;
const FADE_OUT_TIME = 30;

export class ShockAbsorberPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._fillTexture = null;
        this._frames = null;
        this._origin = null;
        this._texturesLoaded = false;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;

        try { this._fillTexture = tl.texture.load('Textures/Projectiles/ShockAbsorberPro_Fill.png'); } catch (_) { }
        const texture = this._fillTexture;
        if (!texture) return;

        const frameHeight = Math.floor(texture.Height / FRAME_COUNT);
        this._origin = Vector2.new(texture.Width / 2, frameHeight / 2);
        this._frames = new Array(FRAME_COUNT);
        for (let index = 0; index < FRAME_COUNT; index++) {
            this._frames[index] = Rectangle.new(0, index * frameHeight, texture.Width, frameHeight);
        }
    }

    _createActivationDust(proj) {
        const center = proj.Center;
        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(center, 10, 10, 88, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 0, Color.White, 1.15);
            Main.dust[dustIndex].noGravity = true;
        }
    }

    _updateFrame(proj, storage) {
        if (storage >= 1000) {
            proj.frame = 5;
            Effects.AddLight(proj.Center, 0.15, 0.15, 0.35);
        } else if (storage >= 800) {
            proj.frame = 4;
            Effects.AddLight(proj.Center, 0.1, 0.1, 0.25);
        } else if (storage >= 600) {
            proj.frame = 3;
            Effects.AddLight(proj.Center, 0.1, 0.1, 0.2);
        } else if (storage >= 400) {
            proj.frame = 2;
            Effects.AddLight(proj.Center, 0.05, 0.05, 0.15);
        } else if (storage >= 200) {
            proj.frame = 1;
            Effects.AddLight(proj.Center, 0.05, 0.05, 0.1);
        } else {
            proj.frame = 0;
        }
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAME_COUNT;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, lightColor) {
        if (proj.timeLeft > FADE_OUT_TIME) return Color.White;
        return Color.new(255, 255, 255, Math.floor(255 * (proj.timeLeft / FADE_OUT_TIME)));
    }

    PostDraw(proj, lightColor) {
        this._loadTextures();
        if (!this._fillTexture || !this._frames) return;

        const storage = ThoriumPlayer.accShockAbsorberStorage;
        const alpha = storage < MAX_STORAGE ? 0.35 : 0.5;
        const color = Color.op_Multiply(Color.op_Multiply(Color.White, alpha), proj.Opacity);

        Main.spriteBatch[DRAW](
            this._fillTexture,
            Vector2.Subtract(proj.Center, Main.screenPosition),
            this._frames[proj.frame],
            color,
            proj.rotation,
            this._origin,
            1,
            SpriteEffects.None,
            0
        );
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead || !ThoriumPlayer.accShockAbsorber || player.ownedProjectileCounts[proj.type] > 1) {
            proj.Kill();
            return;
        }

        // proj.ai nao aceita indexacao direta (NativeObject); o acesso passa pelo ProjAI.
        const ai = new ProjAI(proj, false);
        if (ai[0] > 0) {
            this._createActivationDust(proj);
            ai[0] = 0;
        }

        const storage = ThoriumPlayer.accShockAbsorberStorage;
        this._updateFrame(proj, storage);

        proj.timeLeft = 2;
        proj.direction = player.direction;
        proj.spriteDirection = proj.direction;
        Effects.AddLight(proj.Center, 0.35, 0.35, 0.1);

        const destination = Vector2.Subtract(player.Center, proj.Center);
        destination.X += 40 * proj.direction;
        destination.Y -= 40;

        const distance = destination.Length();
        if (distance > 1000) proj.Center = player.Center;

        let inertia = 3;
        let speed = 4;
        if (distance > 200) {
            speed += (distance - 200) * 0.1;
            proj.tileCollide = false;
        }

        if (distance < speed) {
            proj.velocity = Vector2.Multiply(proj.velocity, 0.25);
            speed = distance;
        }

        if (destination.X !== 0 || destination.Y !== 0) {
            const normalized = Vector2.SafeNormalize(destination, Vector2.Zero);
            destination.X = normalized.X * speed;
            destination.Y = normalized.Y * speed;
        }

        proj.velocity = Vector2.Divide(Vector2.Add(Vector2.Multiply(proj.velocity, inertia - 1), destination), inertia);

        if (proj.velocity.Length() > 6) {
            let targetRotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;
            if (Math.abs(proj.rotation - targetRotation) >= 3.14) {
                if (targetRotation < proj.rotation) proj.rotation -= Math.PI * 2;
                else proj.rotation += Math.PI * 2;
            }
            proj.rotation = (proj.rotation * 4 + targetRotation) / 5;
            return;
        }

        if (proj.rotation > 3.14) proj.rotation -= Math.PI * 2;
        if (proj.rotation > -0.01 && proj.rotation < 0.01) proj.rotation = 0;
        else proj.rotation *= 0.9;
    }
}
