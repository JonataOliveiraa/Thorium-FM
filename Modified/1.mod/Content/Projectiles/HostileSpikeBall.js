import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;

// Metodo pego UMA unica vez, fora da classe
const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float worthless)'];

const EFFECT_PATH = 'Textures/Projectiles/HostileSpikeBall_Effect.png';
const EFFECT_SCALE = Vector2.new(1.25, 1.25);
const FADE_OUT_TIME = 30;

// Textura carregada uma vez so; _tried evita tentar de novo todo frame se falhar
let _effectTex = null;
let _effectOrigin = null;
let _tried = false;

function getEffectTexture() {
    if (_tried) return _effectTex;
    _tried = true;
    try {
        if (tl.file.exists(EFFECT_PATH)) {
            _effectTex = tl.texture.load(EFFECT_PATH);
            _effectOrigin = Vector2.new(_effectTex.Width * 0.5, _effectTex.Height * 0.5);
        }
    } catch (e) {
        tl.log('[HostileSpikeBall] falha ao carregar o efeito: ' + e);
    }
    return _effectTex;
}

export class HostileSpikeBall extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 14;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = false;

        this.AIType = Terraria.ID.ProjectileID.SpikyBall;
    }

    AI(proj) {
        if (proj.timeLeft < FADE_OUT_TIME) {
            proj.alpha = Math.floor(255 * (1 - proj.timeLeft / FADE_OUT_TIME));
        }
    }

    OnTileCollide(proj, hitDirection) {
        return false;
    }

    PreDraw(proj, lightColor) {
        const texture = getEffectTexture();
        if (!texture) return true;

        const drawPos = Vector2.Subtract(proj.Center, Main.screenPosition);
        const opacity = proj.Opacity * 0.75;
        const color = Color.new(255, 255, 255, Math.floor(100 * opacity));

        EntitySpriteDraw(
            texture,
            drawPos,
            null,
            color,
            proj.rotation,
            _effectOrigin,
            EFFECT_SCALE,
            SpriteEffects.None,
            0
        );

        return true; 
    }
}