import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const TRAIL_LENGTH = 5;
const TRAIL_TINT = 0.25;

const DRAG = 0.975;
const SPIN = 0.25;

const DUST_SPAWN = 176;
const SPAWN_DUST_COUNT = 15;
const SPAWN_DUST_SPEED = 2;
const SPAWN_DUST_SCALE = 1.25;

const DUST_POP = 99;
const KILL_DUST_COUNT = 10;
const KILL_DUST_BOX = 10;
const KILL_DUST_SPEED = 3;
const KILL_DUST_ALPHA = 125;
const KILL_DUST_SCALE = 1.25;

export class NanoClamCaneProPearl extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._origin = null;
        this._frame = null;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL_LENGTH;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
    }

    AI(proj) {
        proj.velocity = Vector2.Multiply(proj.velocity, DRAG);
        proj.rotation += proj.velocity.X > 0 ? SPIN : -SPIN;

        const ai = new ProjAI(proj, false);
        if (ai[0] !== 1) return;
        ai[0] = 0;

        for (let i = 0; i < SPAWN_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, DUST_SPAWN,
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                Rand.NextFloat(-SPAWN_DUST_SPEED, SPAWN_DUST_SPEED),
                0, Color.Transparent, SPAWN_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }

        PlaySound(Terraria.ID.SoundID.Item95, proj.Center, 0, 1);
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < KILL_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, KILL_DUST_BOX, KILL_DUST_BOX, DUST_POP,
                Rand.NextFloat(-KILL_DUST_SPEED, KILL_DUST_SPEED),
                Rand.NextFloat(-KILL_DUST_SPEED, KILL_DUST_SPEED),
                KILL_DUST_ALPHA, Color.Transparent, KILL_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return true;

        if (!this._origin) this._origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        if (!this._frame) this._frame = Rectangle.new(0, 0, texture.Width, texture.Height);

        const screen = Main.screenPosition;
        const gfx = proj.gfxOffY;
        const trail = proj.oldPos;
        const count = trail.Length;
        const tint = proj['Color GetAlpha(Color newColor)'](lightColor);

        for (let i = 0; i < count; i++) {
            const pos = trail.get_Item(i);
            const fade = Color.Multiply(
                Color.Multiply(tint, (count - i) / count),
                TRAIL_TINT
            );

            Main[ENTITY_DRAW](
                texture,
                Vector2.new(
                    pos.X - screen.X + this._origin.X,
                    pos.Y - screen.Y + this._origin.Y + gfx
                ),
                this._frame, fade, proj.rotation, this._origin, proj.scale, null, 0
            );
        }

        return true;
    }
}
