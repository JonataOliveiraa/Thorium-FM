import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';

const FRAMES = 2;
const FRAME_RATE = 4;
const TRAIL_LENGTH = 6;
const TRAIL_TINT = 0.1;

const LIFETIME = 180;

const CHASE_FROM = 150;
const CHASE_UNTIL = 120;

const CHASE_RANGE = 500;
const CHASE_SPEED = 8;
const CHASE_INERTIA = 20;

const MAX_ALPHA = 255;

const FADE_IN_SPEED = 10;
const FADE_IN_TIME = Math.floor(MAX_ALPHA / FADE_IN_SPEED);
const FADE_OUT_TIME = 30;
const FADE_OUT_SPEED = Math.floor(MAX_ALPHA / FADE_OUT_TIME);

const FADE_IN_UNTIL = LIFETIME - FADE_IN_TIME;

const ROTATION_OFFSET = -Math.PI / 2;

export class DevourerStaffPro3 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._origin = null;
        this._frames = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL_LENGTH;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;

        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.alpha = MAX_ALPHA;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.extraUpdates = 1;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 90;
    }

    AI(proj) {
        const timeLeft = proj.timeLeft;
        this.Chase(proj, timeLeft);

        this.Fade(proj, timeLeft);
        this.Animate(proj);
    }

    Chase(proj, timeLeft) {
        if (timeLeft <= CHASE_UNTIL || timeLeft >= CHASE_FROM) return;

        const center = proj.Center;
        const npcs = Main.npc;
        const maxNPCs = Main.maxNPCs;

        let bestX = center.X;
        let bestY = center.Y;
        let best = CHASE_RANGE;
        let found = false;

        for (let i = 0; i < maxNPCs; i++) {
            const npc = npcs[i];

            if (!npc || !npc.active) continue;
            if (!npc.CanBeChasedBy(null, false)) continue;

            const npcCenter = npc.Center;
            const manhattan = Math.abs(center.X - npcCenter.X) + Math.abs(center.Y - npcCenter.Y);
            if (manhattan >= best) continue;

            best = manhattan;
            bestX = npcCenter.X;
            bestY = npcCenter.Y;
            found = true;
        }

        if (!found) return;

        const dx = bestX - center.X;
        const dy = bestY - center.Y;
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = len > 0 ? CHASE_SPEED / len : 0;

        const vel = proj.velocity;
        proj.velocity = Vector2.new(
            (vel.X * CHASE_INERTIA + dx * scale) / (CHASE_INERTIA + 1),
            (vel.Y * CHASE_INERTIA + dy * scale) / (CHASE_INERTIA + 1)
        );
    }

    Fade(proj, timeLeft) {
        if (timeLeft < FADE_OUT_TIME) {
            proj.alpha = Math.min(MAX_ALPHA, proj.alpha + FADE_OUT_SPEED);
        }
        if (timeLeft >= FADE_IN_UNTIL) {
            proj.alpha = Math.max(0, proj.alpha - FADE_IN_SPEED);
        }

        const vel = proj.velocity;
        proj.rotation = Math.atan2(vel.Y, vel.X) + ROTATION_OFFSET;
    }

    Animate(proj) {
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

    OnTileCollide(proj, hitDirection) {
        return proj.timeLeft <= 0;
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return true;

        if (!this._frames) {
            const frameHeight = (texture.Height / FRAMES) | 0;

            this._origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
            this._frames = [];
            for (let i = 0; i < FRAMES; i++) {
                this._frames.push(Rectangle.new(0, i * frameHeight, texture.Width, frameHeight));
            }
        }

        const source = this._frames[proj.frame] ?? this._frames[0];
        const screen = Main.screenPosition;
        const gfx = proj.gfxOffY;
        const trail = proj.oldPos;
        const count = trail.Length;
        const tint = proj['Color GetAlpha(Color newColor)'](Color.Multiply(lightColor, TRAIL_TINT));

        for (let i = 0; i < count; i++) {
            const pos = trail.get_Item(i);
            const fade = Color.Multiply(tint, (count - i) / count);

            Main[ENTITY_DRAW](
                texture,
                Vector2.new(
                    pos.X - screen.X + this._origin.X,
                    pos.Y - screen.Y + this._origin.Y + gfx
                ),
                source, fade, proj.rotation, this._origin, proj.scale, null, 0
            );
        }

        return true;
    }
}
