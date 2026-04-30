import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { CameraShake, FadeController } from './../../TL/Modules/Camera.js';

// --- IMPORTAÇÕES NATIVAS ---
const { Camera, Color, Vector2, Rectangle } = Modules;
const Main = new NativeClass('Terraria', 'Main');
const Player = new NativeClass('Terraria', 'Player');
const Vector2Native = new NativeClass('Microsoft.Xna.Framework', 'Vector2');
const NPC = new NativeClass('Terraria', 'NPC');
const SoundEngine = new NativeClass('Terraria.Audio', 'SoundEngine');
const Dust = new NativeClass('Terraria', 'Dust');
const Projectile = new NativeClass('Terraria', 'Projectile');
const UnifiedRandom = new NativeClass('Terraria.Utilities', 'UnifiedRandom');
const SpriteEffects = new NativeClass('Microsoft.Xna.Framework.Graphics', 'SpriteEffects');
const TextureAssets = new NativeClass('Terraria.GameContent', 'TextureAssets');

const PlaySound = SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];
const NewProjectile2 = Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const Next = UnifiedRandom['int Next(int minValue, int maxValue)'];
const vector = (x, y) => { let v = Vector2Native.new(); v.X = x; v.Y = y; return v; };
const NewNPC = NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const SpriteSortMode = new NativeClass('Microsoft.Xna.Framework.Graphics', 'SpriteSortMode');
const BlendState = new NativeClass('Microsoft.Xna.Framework.Graphics', 'BlendState');
const DepthStencilState = new NativeClass('Microsoft.Xna.Framework.Graphics', 'DepthStencilState');


function AnyPlayerAlive() {
    for (let i = 0; i < Main.maxPlayers; i++) {
        const p = Main.player[i];
        if (p.active && !p.dead) return true;
    }
    return false;
}

const BEGIN_METHOD = 'void Begin(SpriteSortMode sortMode, BlendState blendState, SamplerState samplerState, DepthStencilState depthStencilState, RasterizerState rasterizerState, Effect effect, Nullable`1 transformMatrix, bool defferedBatch)';
const ENTITY_DRAW_METHOD = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';



export class VFX {
    
    static BeginAdditive() {
        Main.spriteBatch.End();
        Main.spriteBatch[BEGIN_METHOD](
            SpriteSortMode.Deferred, BlendState.Additive, Main.DefaultSamplerState, DepthStencilState.None, Main.Rasterizer, null, Main.Transform, true
        );
    }

    static BeginAlphaBlend() {
        Main.spriteBatch.End();
        Main.spriteBatch[BEGIN_METHOD](
            SpriteSortMode.Deferred, BlendState.AlphaBlend, Main.DefaultSamplerState, DepthStencilState.None, Main.Rasterizer, null, Main.Transform, true
        );
    }

    // ==========================================
    // 2. HELPER DE CORES
    // ==========================================
    
    static MakeColor(r, g, b, a) {
        const c = Modules.Color.new();
        c.R = r; c.G = g; c.B = b; c.A = a;
        return c;
    }

    // ==========================================
    // 3. DESENHO DE RASTROS (TRAILS) AVANÇADOS
    // ==========================================
    
    static DrawAdvancedTrail(tex, srcRect, origin, trailPos, trailRot, baseScale, colorOuter, colorInner, fadeAlpha = 1.0) {
        if (!tex || !trailPos || trailPos.length === 0) return;

        const screenX = Main.screenPosition.X;
        const screenY = Main.screenPosition.Y;

        for (let i = trailPos.length - 1; i >= 0; i--) {
            const pos = trailPos[i];
            if (!pos) continue;

            const drawPos = Microsoft.Xna.Framework.Vector2.new(); 
            drawPos.X = pos.X - screenX; 
            drawPos.Y = pos.Y - screenY;
            
            const stepFade = (trailPos.length - i) / trailPos.length; 
            const globalFade = stepFade * fadeAlpha;

            const smoothAura = Math.pow(globalFade, 1.2); 
            const smoothCore = Math.pow(globalFade, 0.5); 

            // Criando cores de forma segura
            const cOut = VFX.MakeColor(
                Math.floor(colorOuter.R * smoothAura),
                Math.floor(colorOuter.G * smoothAura),
                Math.floor(colorOuter.B * smoothAura),
                0
            );

            const cIn = VFX.MakeColor(
                Math.floor(colorInner.R * smoothCore),
                Math.floor(colorInner.G * smoothCore),
                Math.floor(colorInner.B * smoothCore),
                0
            );

            const rot = (trailRot && typeof trailRot[i] === 'number') ? trailRot[i] : 0;
            const finalScale = baseScale * stepFade * (0.8 + 0.2 * fadeAlpha);

            // Chamando o método DIRETO DO MAIN (Isso resolve o crash!)
            Main[ENTITY_DRAW_METHOD](tex, drawPos, srcRect, cOut, rot, origin, finalScale * 1.5, SpriteEffects.None, 0);
            Main[ENTITY_DRAW_METHOD](tex, drawPos, srcRect, cIn, rot, origin, finalScale * 1.0, SpriteEffects.None, 0);
        }
    }

    // ==========================================
    // 4. DESENHO NEON SIMPLES (GLOW)
    // ==========================================
    
    static DrawNeonSprite(tex, srcRect, origin, center, rot, scale, mainColor, coreColor, fadeAlpha = 1.0) {
        const drawPos = Microsoft.Xna.Framework.Vector2.new();
        drawPos.X = center.X - Main.screenPosition.X;
        drawPos.Y = center.Y - Main.screenPosition.Y;

        const cOut = VFX.MakeColor(
            Math.floor(mainColor.R * fadeAlpha),
            Math.floor(mainColor.G * fadeAlpha),
            Math.floor(mainColor.B * fadeAlpha),
            0
        );

        const cIn = VFX.MakeColor(
            Math.floor(coreColor.R * fadeAlpha),
            Math.floor(coreColor.G * fadeAlpha),
            Math.floor(coreColor.B * fadeAlpha),
            0
        );

        // Chamando o método DIRETO DO MAIN
        Main[ENTITY_DRAW_METHOD](tex, drawPos, srcRect, cOut, rot, origin, scale * 1.4, SpriteEffects.None, 0); 
        Main[ENTITY_DRAW_METHOD](tex, drawPos, srcRect, cIn, rot, origin, scale * 0.9, SpriteEffects.None, 0); 
    }
}
