import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Effects, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const Frame = Terraria.Utils['Rectangle Frame(Texture2D tex, int horizontalFrames, int verticalFrames, int frameX, int frameY, int sizeOffsetX, int sizeOffsetY)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

function remap(value, oldMin, oldMax, newMin, newMax, clamp) {
    let t = (value - oldMin) / (oldMax - oldMin);
    if (clamp) t = Math.max(0, Math.min(1, t));
    return newMin + (newMax - newMin) * t;
}

function hslToRgb(h, s, l) {
    h = ((h % 1) + 1) % 1;
    const c = (1 - Math.abs(2 * l - 1)) * s;
    const x = c * (1 - Math.abs((h * 6) % 2 - 1));
    const m = l - c / 2;
    let r = 0, g = 0, b = 0;
    if (h < 1 / 6) { r = c; g = x; b = 0; }
    else if (h < 2 / 6) { r = x; g = c; b = 0; }
    else if (h < 3 / 6) { r = 0; g = c; b = x; }
    else if (h < 4 / 6) { r = 0; g = x; b = c; }
    else if (h < 5 / 6) { r = x; g = 0; b = c; }
    else { r = c; g = 0; b = x; }
    return Color.new(Math.round((r + m) * 255), Math.round((g + m) * 255), Math.round((b + m) * 255));
}

function colorLerp(c1, c2, t) {
    return Color.Lerp(c1, c2, t);
}

const VISUAL_TIMER_SPEED_CAP = 1.75;
const VISUAL_TIMER_SPEED_REDUCTION = 0.0333333351;

export class GraniteBoomBoxPro extends ModProjectile {
    VisualTimer = 0;
    VisualTimerSpeed = 1.0;
    spawnedTimeLeft = 1200;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.fadeInTime = 30;
        this.fadeOutTime = 120;
    }

    SetDefaults() {
        this.Projectile.width = 2;
        this.Projectile.height = 2;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.ignoreWater = true;
        this.Projectile.tileCollide = false;
        this.Projectile.netImportant = true;
        this.Projectile.timeLeft = this.spawnedTimeLeft;
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[proj.type].Value;
        const textureHeight = texture.Height;
        const opacity = proj.Opacity;
        const numSegments = 36;
        const baseOffset = Vector2.Multiply(Vector2.UnitY, 50);
        const gfxOffY = proj.gfxOffY;
        const screenPos = Terraria.Main.screenPosition;
        const origin = Vector2.One;

        for (let index = 0; index < numSegments; index++) {
            const timerPhase = this.VisualTimer * 6.28318548 / numSegments;
            const t = index / numSegments;
            const angle = 6.28318548 * t;
            const drawPos = Vector2.Add(proj.Center, Vector2.RotatedBy(baseOffset, angle, Vector2.Zero));
            drawPos.Y += gfxOffY;

            const wave = Math.sin(8 * t * 6.2831854820251465 + timerPhase) * Math.sin((0.25 * 8) * (1 - t) * 6.2831854820251465 + timerPhase);
            const speedFactor = remap(this.VisualTimerSpeed, 1, VISUAL_TIMER_SPEED_CAP, 0, 1, true) * (4 * (0.5 - Math.abs(0.5 - t)));
            const speedBoost = speedFactor * speedFactor * 0.5 + 1;
            const heightOffset = Math.floor(wave * speedBoost * 0.699999988079071 * -0.75 * textureHeight);
            const rectangle = Frame(texture, 1, 1, 0, 0, 0, heightOffset);

            const hue1 = 0.60000002384185791 + Math.sin(2 * t * 6.2831854820251465 + timerPhase) * 0.10000000149011612;
            const rgb1 = hslToRgb(hue1, 1, 0.6);
            const hue2 = 0.699999988079071 + Math.sin(0.5067085 * t * 6.2831854820251465 + 0.4 * timerPhase) * 0.10000000149011612;
            const rgb2 = hslToRgb(hue2, 1, 0.6);
            const color = Color.Multiply(Color.Multiply(colorLerp(rgb1, rgb2, 0.5), opacity), 0.8);

            EntitySpriteDraw(texture, Vector2.Subtract(drawPos, screenPos), rectangle, color, angle, origin, opacity, null, 0.0);
        }
        return false;
    }

    Prolong(proj) {
        proj.timeLeft = this.spawnedTimeLeft - this.fadeInTime;
        proj.Opacity = 1.0;
    }

    SetPulseFX() {
        this.VisualTimerSpeed = VISUAL_TIMER_SPEED_CAP;
    }

    HandleVisual(proj) {
        if (proj.timeLeft >= 120) {
            proj.alpha -= 2;
            if (proj.alpha < 0) proj.alpha = 0;
        } else {
            proj.alpha += 2;
            if (proj.alpha > 255) proj.alpha = 255;
        }
        
        this.VisualTimer += this.VisualTimerSpeed;
        if (this.VisualTimerSpeed > VISUAL_TIMER_SPEED_CAP) {
            this.VisualTimerSpeed = VISUAL_TIMER_SPEED_CAP;
        }
        if (this.VisualTimerSpeed <= 1.0) return;
        this.VisualTimerSpeed -= VISUAL_TIMER_SPEED_REDUCTION;
        if (this.VisualTimerSpeed >= 1.0) return;
        this.VisualTimerSpeed = 1.0;
    }

    AI(proj) {
        const player = Terraria.Main.player[proj.owner];
        if (player.dead) {
            proj.Kill();
            return;
        }
        
        this.HandleVisual(proj);
        Effects.AddLight(proj.Center, 0.1, 0.5, 0.7);
        proj.Center = player.Center;
        proj.gfxOffY = player.gfxOffY;
        proj.spriteDirection = player.direction;
        proj.velocity = Vector2.Zero;

        const ai = new ProjAI(proj);
        ai[0]++;
        if (ai[0] < 0.0) return;

        if (proj.owner === Terraria.Main.myPlayer && proj.timeLeft > this.fadeOutTime) {
            let nearest = proj.FindTargetWithinRange(400, true);

            if (nearest !== null) {
                const source = proj.GetProjectileSource_FromThis();
                const center = proj.Center;
                let dir = Vector2.Subtract(nearest.Center, center);
                const length = dir['float Length()']();
                if (length > 5) {
                    dir = Vector2.Multiply(dir, 5 / length);
                }
                NewProjectile(source, center, Vector2.Multiply(dir, 1.15), ModProjectile.getTypeByName('GraniteBoomBoxPro2'), proj.damage, proj.knockBack, proj.owner, 0.0, 0.0, 0.0, null);
            }
        }
        ai[0] = -20.0;
    }
}
