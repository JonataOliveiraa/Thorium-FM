import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Main } = Terraria;
const { Color, Vector2 } = Modules;
const SpriteEffects = Microsoft.Xna.Framework.Graphics.SpriteEffects;

const MIN_LENGTH = 30;
const MAX_LENGTH = 240;
const ANGLE_SPEED = 0.012;
const SWAY_AMOUNT = 0.45;
const SWAY_SPEED = 0.025;
const LENGTH_SPEED = 0.018;

let _segTex = null, _tipTex = null, _texLoaded = false;
function loadTextures() {
    if (_texLoaded) return;
    _texLoaded = true;
    try { _segTex = tl.texture.load('Textures/Projectiles/Boss/QueenJellyfishArm.png'); } catch (_) { }
    try { _tipTex = tl.texture.load('Textures/Projectiles/Boss/QueenJellyfishArmTip.png'); } catch (_) { }
}

let _queenType = -1;
function ensureQueenType() {
    if (_queenType < 0) _queenType = ModNPC.getTypeByName('QueenJellyfish');
}

export class QueenJellyfishArm extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 24;
        this.Projectile.height = 24;
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
        this.Projectile.netImportant = true;
    }

    AI(proj) {
        ensureQueenType();
        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);

        const bossIndex = ai[0] | 0;
        const armIndex = ai[1] | 0;

        const boss = Main.npc[bossIndex];
        if (!boss || !boss.active || boss.type !== _queenType || boss.life <= 0) {
            proj.Kill();
            return;
        }

        proj.timeLeft = 4;

        // localAI[0] = phase counter
        localAI[0] = (localAI[0] || 0) + 1;
        const t = localAI[0];

        const baseAngle = (armIndex / 4) * Math.PI * 2 + t * ANGLE_SPEED;
        const swayPhase = t * SWAY_SPEED + armIndex * 0.7;
        const angle = baseAngle + Math.sin(swayPhase) * SWAY_AMOUNT;

        const lengthPhase = t * LENGTH_SPEED + armIndex * 0.5;
        const length = MIN_LENGTH + (MAX_LENGTH - MIN_LENGTH) * (Math.sin(lengthPhase) * 0.5 + 0.5);

        // localAI[1] = angle, localAI[2] = length (read by PreDraw)
        localAI[1] = angle;
        localAI[2] = length;

        const tipX = boss.Center.X + Math.cos(angle) * length;
        const tipY = boss.Center.Y + Math.sin(angle) * length;
        proj.position = Vector2.new(tipX - proj.width / 2, tipY - proj.height / 2);
        proj.velocity = Vector2.Zero;
        proj.rotation = angle;
    }

    // Projectile.PreDraw signature is (proj, lightColor) — read screenPos and spriteBatch from Main directly
    PreDraw(proj, lightColor) {
        loadTextures();
        ensureQueenType();

        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);

        const boss = Main.npc[ai[0] | 0];
        if (!boss || !boss.active) return false;

        const angle = localAI[1];
        const length = localAI[2];
        if (length <= 0) return false;

        const screenPos = Main.screenPosition;
        const Draw = Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];

        const cosA = Math.cos(angle);
        const sinA = Math.sin(angle);
        // Sprites default-facing: RIGHT (horizontal), so rotation = angle (no +π/2 offset)
        const rotation = angle;

        // Fallback: magenta debug marker if textures didn't load
        if (!_segTex || !_tipTex) {
            const drawX = boss.Center.X + cosA * length - screenPos.X;
            const drawY = boss.Center.Y + sinA * length - screenPos.Y;
            try {
                const pixel = Terraria.GameContent.TextureAssets.MagicPixel.Value;
                if (pixel) {
                    Draw(pixel, Vector2.new(drawX, drawY), null, Color.Magenta, 0, Vector2.new(0.5, 0.5), 16, SpriteEffects.None, 0);
                }
            } catch (_) { }
            return false;
        }

        const segH = _segTex.Height || 16;
        const tipH = _tipTex.Height || 16;

        const segOrigin = Vector2.new(_segTex.Width / 2, segH / 2);
        const tipOrigin = Vector2.new(_tipTex.Width / 2, _tipTex.Height / 2);

        const segmentableLength = length - tipH;
        const segments = Math.max(1, Math.ceil(segmentableLength / segH));
        const step = segmentableLength / segments;

        for (let i = 0; i < segments; i++) {
            const dist = (i + 0.5) * step;
            const px = boss.Center.X + cosA * dist - screenPos.X;
            const py = boss.Center.Y + sinA * dist - screenPos.Y;
            Draw(_segTex, Vector2.new(px, py), null, Color.White, rotation, segOrigin, 1.0, SpriteEffects.None, 0);
        }

        const tipDist = length - tipH / 2;
        const tipX = boss.Center.X + cosA * tipDist - screenPos.X;
        const tipY = boss.Center.Y + sinA * tipDist - screenPos.Y;
        Draw(_tipTex, Vector2.new(tipX, tipY), null, Color.White, rotation, tipOrigin, 1.0, SpriteEffects.None, 0);

        return false;
    }
}
