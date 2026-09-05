import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Rand, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class AntlionStaffPro2 extends ModProjectile {
    static GRAVITY = 0.1;
    static LIFETIME = 180;
    static DUST = 32;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._frame = null;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = AntlionStaffPro2.LIFETIME;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);

        if (local[0] === 0) {
            local[0] = 1;
            PlaySound(Terraria.ID.SoundID.Item17, proj.Center, 0, 1);
        }

        const vel = proj.velocity;
        proj.velocity = Vector2.new(vel.X, vel.Y + AntlionStaffPro2.GRAVITY);

        if (proj.timeLeft !== AntlionStaffPro2.LIFETIME) return;

        for (let i = 0; i < 8; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, AntlionStaffPro2.DUST,
                Rand.NextFloat(-2, 2), Rand.NextFloat(-6, -3), 100, Color.Transparent, 1.35
            );
            if (dust) dust.noGravity = true;
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 10; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, AntlionStaffPro2.DUST,
                Rand.NextFloat(-4, 4), Rand.NextFloat(-4, 4), 150, Color.Transparent, 1.25
            );
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!this._frame) this._frame = Rectangle.new(0, 0, texture.Width, texture.Height);
        if (!texture) return true;

        const origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const screen = Main.screenPosition;
        const gfx = Vector2.new(0, proj.gfxOffY);
        const trail = proj.oldPos;
        const count = trail.Length;
        const GetPos = trail.get_Item;
        const alpha = proj['Color GetAlpha(Color newColor)'](lightColor);

        for (let k = 0; k < count; k++) {
            const pos = Vector2.Add(Vector2.Add(Vector2.Subtract(GetPos(k), screen), origin), gfx);
            const fade = Color.Multiply(alpha, (count - k) / count);
            Main[ENTITY_DRAW](texture, pos, this._frame, fade, proj.rotation, origin, proj.scale, null, 0);
        }

        return true;
    }
}
