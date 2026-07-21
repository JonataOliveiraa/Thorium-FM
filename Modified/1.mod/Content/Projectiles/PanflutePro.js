import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { Rand } from '../../TL/Modules/Rand.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const EntitySpriteDraw = Main[
    'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'
];

const _vecHelper = Vector2.new(0, 0);

export class PanflutePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.fadeOutTime = 30;
        this.HomingRange = 600;
        this.HomingSpeed = 10;
        this.HomingLerp = 0.1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 6;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 10;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

        if (proj.timeLeft <= this.fadeOutTime) {
            proj.alpha = 255 - Math.floor((proj.timeLeft / this.fadeOutTime) * (255 - 150));
        }

        proj.frameCounter++;
        if (proj.frameCounter > 6) {
            proj.frame++;
            proj.frameCounter = 0;
            if (proj.frame >= 6) proj.frame = 0;
        }

        const target = proj['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'](this.HomingRange, false);
        if (target != null && target.active) {
            _vecHelper.X = target.Center.X - proj.Center.X;
            _vecHelper.Y = target.Center.Y - proj.Center.Y;
            const len = Math.sqrt(_vecHelper.X * _vecHelper.X + _vecHelper.Y * _vecHelper.Y);
            _vecHelper.X = (_vecHelper.X / len) * this.HomingSpeed;
            _vecHelper.Y = (_vecHelper.Y / len) * this.HomingSpeed;
            proj.velocity = Vector2.Lerp(proj.velocity, _vecHelper, this.HomingLerp);
        } else {
            proj.velocity = Vector2.Multiply(proj.velocity, 1.03);
        }

        Effects.AddLight(proj.Center, 0.05, 0.2, 0.4);
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return false;

        const origin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const frameHeight = texture.Height / Main.projFrames[this.Type];
        const sourceRect = Rectangle.new(0, proj.frame * frameHeight, texture.Width, frameHeight);
        const rotation = proj.rotation;
        const scale = proj.scale;
        const gfxOffY = proj.gfxOffY;

        for (let k = proj.oldPos.Length - 1; k > 0; k--) {
            if (k % 2 !== 0) continue;
            const pos = proj.oldPos.get_Item(k);
            if (pos.X === 0 && pos.Y === 0) continue;

            _vecHelper.X = pos.X - Main.screenPosition.X + origin.X;
            _vecHelper.Y = pos.Y - Main.screenPosition.Y + origin.Y + gfxOffY;

            EntitySpriteDraw(
                texture, _vecHelper, sourceRect, Color.Multiply(lightColor, 0.25),
                rotation, origin, scale,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
            );
        }
        return true;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 5; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                157,
                Rand.NextFloat(-3, 3),
                Rand.NextFloat(-3, 3),
                0, Color.White, 1.0
            );
            if (dust) dust.noGravity = true;
        }
    }
}