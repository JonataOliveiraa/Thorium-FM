import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects, Rectangle } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const EFFECT_FRAME_COUNT = 8;
const BLOCK_DURATION = 600;
const BLOCK_TRANSFORM_TIME = 540;
const BOB_TIMER_MAX = 80;
const BOB_ROT_OFFSET = 0.3;
const BOB_AMPLITUDE = 6;

const PULSE_STEP = 0.025;
const PULSE_MAX = 0.75;
const FLAT_BASE = 0.45;
const FLAT2_STEP = 0.01;
const FLAT2_MAX = 0.4;

// ai[0] / ai[1] - por projetil, ao contrario do estado de pulso abaixo.
const BLOCK_TIMER = 0;
const BLOCK_FRAME = 1;

export class EnergizedQuadCubePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        // Mascote e' unico por jogador, entao guardar o pulso na instancia
        // singleton do ModProjectile e' seguro aqui.
        this.pulseShift = false;
        this.pulseAmount = 0;
        this.pulseFlat = 0;
        this.pulseFlat2 = 0;
        this.bobTimer = 0;

        this._effect1 = null;
        this._effect2 = null;
        this._effect3 = null;
        this._frames = null;
        this._origins = null;
        this._additive = null;
        this._texturesLoaded = false;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 1;
        Main.projPet[this.Type] = true;

        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            0, 1, 1, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](0, -14).WithSpriteDirection(-1);
    }

    SetDefaults() {
        this.Projectile.netImportant = true;
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 18000;
    }

    _loadTextures() {
        if (this._texturesLoaded) return;
        this._texturesLoaded = true;

        const base = 'Textures/Projectiles/EnergizedQuadCubePro_Effect';
        try { this._effect1 = tl.texture.load(base + '1.png'); } catch (_) { }
        try { this._effect2 = tl.texture.load(base + '2.png'); } catch (_) { }
        try { this._effect3 = tl.texture.load(base + '3.png'); } catch (_) { }

        // Cor aditiva (alpha 0) e os 8 retangulos de frame, montados uma vez so'.
        this._additive = Color.new(255, 255, 255, 0);

        const reference = this._effect1 ?? this._effect2 ?? this._effect3;
        if (!reference) return;

        const frameHeight = Math.floor(reference.Height / EFFECT_FRAME_COUNT);
        this._frames = new Array(EFFECT_FRAME_COUNT);
        for (let index = 0; index < EFFECT_FRAME_COUNT; index++) {
            this._frames[index] = Rectangle.new(0, index * frameHeight, reference.Width, frameHeight);
        }
        this._origins = {
            center: Vector2.new(reference.Width / 2, frameHeight / 2),
            shifted: Vector2.new(reference.Width / 2, frameHeight / 2 + 1)
        };
    }

    get _bobFactorPos() {
        return this.bobTimer / BOB_TIMER_MAX;
    }

    get _bobOffsetY() {
        return Math.sin(this._bobFactorPos * Math.PI * 2) * BOB_AMPLITUDE;
    }

    get _bobRotationSin() {
        return Math.sin(((this._bobFactorPos + BOB_ROT_OFFSET) % 1) * Math.PI * 2);
    }

    _opacity(proj) {
        return 1 - proj.alpha / 255;
    }

    _drawPosition(proj) {
        const center = proj.Center;
        return Vector2.new(
            center.X - Main.screenPosition.X,
            center.Y - Main.screenPosition.Y + this._bobOffsetY
        );
    }

    AuraPulsingEffect() {
        if (!this.pulseShift) {
            this.pulseAmount += PULSE_STEP;
            if (this.pulseAmount >= PULSE_MAX) this.pulseShift = true;
            return;
        }

        this.pulseAmount -= PULSE_STEP;
        if (this.pulseAmount <= 0) this.pulseShift = false;
    }

    // Sorteia um bloco diferente do atual, entre 1 e 7.
    SetNewBlockFrame(ai) {
        const current = ai[BLOCK_FRAME];
        let next = current;
        for (let guard = 0; guard < 8 && next === current; guard++) {
            next = Rand.Next(1, EFFECT_FRAME_COUNT);
        }
        ai[BLOCK_FRAME] = next;
    }

    GetAlpha(proj, lightColor) {
        if (!this._additive) this._additive = Color.new(255, 255, 255, 0);
        return Color.op_Multiply(this._additive, this.pulseFlat * this._opacity(proj));
    }

    // Tudo e' desenhado aqui de proposito: o hook deste framework so' chama
    // PostDraw quando PreDraw devolve true (Hooks/Main.js:138-141), e devolver
    // true faria o jogo redesenhar o sprite base por cima. Com o PostDraw
    // separado as tres camadas de efeito simplesmente nunca apareciam.
    PreDraw(proj, lightColor) {
        this._loadTextures();

        const ai = new ProjAI(proj, false);
        const blockFrame = Math.floor(ai[BLOCK_FRAME]);
        const position = this._drawPosition(proj);
        const opacity = this._opacity(proj);
        const draw = Main.spriteBatch[DRAW];

        // O cubo base so' aparece na forma neutra; nas outras o visual e' todo _Effect.
        if (blockFrame === 0) {
            const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
            if (texture) {
                draw(
                    texture, position, null,
                    this.GetAlpha(proj, lightColor),
                    proj.rotation,
                    Vector2.new(texture.Width / 2, texture.Height / 2),
                    proj.scale, SpriteEffects.None, 0
                );
            }
        }

        if (!this._frames) return false;

        const frame = this._frames[blockFrame % EFFECT_FRAME_COUNT] ?? this._frames[0];

        if (this._effect1) {
            draw(this._effect1, position, frame, Color.op_Multiply(lightColor, opacity), proj.rotation, this._origins.center, proj.scale, SpriteEffects.None, 0);
        }

        // A aura pulsante some quando o cubo entra em transformacao.
        if (this._effect2 && ai[BLOCK_TIMER] <= BLOCK_TRANSFORM_TIME) {
            draw(this._effect2, position, frame, Color.op_Multiply(this._additive, this.pulseAmount * opacity), proj.rotation, this._origins.shifted, proj.scale, SpriteEffects.None, 0);
        }

        if (this._effect3) {
            draw(this._effect3, position, frame, Color.op_Multiply(Color.White, this.pulseFlat2 * opacity), proj.rotation, this._origins.center, proj.scale, SpriteEffects.None, 0);
        }

        return false;
    }

    _updateMovement(proj, player) {
        const center = proj.Center;
        const playerCenter = player.Center;

        let speed = 0.3;
        let targetX = playerCenter.X - center.X + Rand.Next(-10, 21) + 60 * -player.direction;
        let targetY = playerCenter.Y - center.Y + Rand.Next(-10, 21) - 60;

        const distance = Math.sqrt(targetX * targetX + targetY * targetY);

        if (distance < 50) {
            const velocity = proj.velocity;
            if (Math.abs(velocity.X) > 2 || Math.abs(velocity.Y) > 2) {
                proj.velocity = Vector2.Multiply(velocity, 0.99);
            }
            speed = 0.01;
        } else {
            if (distance < 100) speed = 0.1;
            if (distance > 300) speed = 0.4;

            const scale = 6 / distance;
            targetX *= scale;
            targetY *= scale;
        }

        const velocity = proj.velocity;

        if (velocity.X < targetX) {
            velocity.X += speed;
            if (speed > 0.05 && velocity.X < 0) velocity.X += speed;
        } else if (velocity.X > targetX) {
            velocity.X -= speed;
            if (speed > 0.05 && velocity.X > 0) velocity.X -= speed;
        }

        if (velocity.Y < targetY) {
            velocity.Y += speed;
            if (speed > 0.05 && velocity.Y < 0) velocity.Y += speed * 2;
        } else if (velocity.Y > targetY) {
            velocity.Y -= speed;
            if (speed > 0.05 && velocity.Y > 0) velocity.Y -= speed * 2;
        }

        proj.velocity = velocity;
        proj.spriteDirection = velocity.X > 0 ? 1 : -1;
    }

    _transform(proj, ai) {
        this.pulseFlat2 = Math.min(FLAT2_MAX, this.pulseFlat2 + FLAT2_STEP);
        // Gira cada vez mais devagar conforme se aproxima da troca.
        proj.rotation += 0.1 + 0.01 * (BLOCK_TRANSFORM_TIME - ai[BLOCK_TIMER]);

        if (ai[BLOCK_TIMER] <= BLOCK_DURATION) return;

        for (let index = 0; index < 10; index++) {
            const dustIndex = Effects.NewDust(proj.position, proj.width, proj.height, 15, Rand.NextFloat(-3, 3), Rand.NextFloat(-3, 3), 255, Color.White, 1);
            Main.dust[dustIndex].noGravity = true;
        }

        ai[BLOCK_TIMER] = 0;
        this.SetNewBlockFrame(ai);
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) {
            proj.active = false;
            return;
        }

        // Sem isso os mascotes se acumulam e derrubam o FPS: o `ref bool` que o
        // original passa para o BuffHandle nao existe do lado JS, entao a garantia
        // de instancia unica precisa ficar aqui.
        if (player.ownedProjectileCounts[proj.type] > 1) {
            proj.Kill();
            return;
        }

        const ai = new ProjAI(proj, false);

        if (!player.dead) proj.timeLeft = 2;

        this.pulseFlat = ai[BLOCK_FRAME] !== 0 ? 0 : FLAT_BASE;
        this.AuraPulsingEffect();

        // Teleporte de seguranca se o mascote ficar para tras.
        if (Vector2.DistanceSquared(proj.Center, player.Center) > 1000000) {
            proj.Center = player.Center;
        }

        this._updateMovement(proj, player);

        ai[BLOCK_TIMER]++;

        if (ai[BLOCK_TIMER] > BLOCK_TRANSFORM_TIME) {
            this._transform(proj, ai);
            return;
        }

        this.bobTimer++;
        if (this.bobTimer >= BOB_TIMER_MAX) this.bobTimer = 0;

        this.pulseFlat2 = 0;
        proj.rotation = proj.velocity.X * 0.05 + this._bobRotationSin * 0.08;
    }
}
