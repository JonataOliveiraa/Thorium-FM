import { ModAsset } from '../../TL/ModAsset.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModTexture } from '../../TL/ModTexture.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';
import { Terraria, Modules, Microsoft } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Main, Lighting } = Terraria
const { Color, Effects, MathHelper, Vector2 } = Modules;

export class SparkingJellyBallPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 22;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.melee = true;
        this.Projectile.scale = 0.8;
        this.Projectile.drawLayer = 7;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;

        this.Projectile.aiStyle = Terraria.ID.ProjAIStyleID.Flail;
        this.AIType = 947;
        this.DefaultToFlail();
    }

    GetAlpha(proj, lightColor) {
        return Color.White;
    }

    PreDraw(proj, lightColor) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) return false;

        const chainTexture = tl.texture.load('Textures/Projectiles/SparkingJellyBallPro_Chain.png');
        if (!chainTexture) return false;

        const playerArmPos = player.RotatedRelativePoint(player.MountedCenter, true, true);
        const projCenter = proj.Center;

        const diff = Vector2.Subtract(projCenter, playerArmPos);
        const dir = Vector2.Normalize(diff);
        const dirToProj = Vector2.Normalize(Vector2.Subtract(projCenter, playerArmPos));
        const armPosCorrected = Vector2.Add(playerArmPos, Vector2.Multiply(dirToProj, 4));
        const v1 = Vector2.Subtract(armPosCorrected, projCenter);
        const v2 = Vector2.Normalize(v1);

        const segmentHeight = chainTexture.Height;
        const rotation = Math.atan2(v2.Y, v2.X) + Math.PI / 2;
        const chainOrigin = Vector2.new(chainTexture.Width * 0.5, chainTexture.Height * 0.5);

        let num4 = v1.Length() + segmentHeight / 2;
        let currentPos = projCenter;

        while (num4 > 0) {
            const tileColor = Lighting['Color GetColor(int x, int y)'](
                Math.floor(currentPos.X / 16),
                Math.floor(currentPos.Y / 16)
            );
            Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)'](
                chainTexture,
                Vector2.Subtract(currentPos, Main.screenPosition),
                null,
                tileColor,
                rotation,
                chainOrigin,
                Vector2.One,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None,
                0
            );
            currentPos = Vector2.Add(currentPos, Vector2.Multiply(v2, segmentHeight));
            num4 -= segmentHeight;
        }

        const projTexture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const frameHeight = projTexture.Height / 6;
        const frame = proj.frame % 6;
        const sourceRect = Rectangle.new(0, frame * frameHeight, projTexture.Width, frameHeight);
        const projOrigin = Vector2.new(projTexture.Width * 0.5, frameHeight * 0.5);
        const baseDrawPos = Vector2.Subtract(projCenter, Main.screenPosition);
        const baseColor = Lighting['Color GetColor(int x, int y)'](
            Math.floor(projCenter.X / 16),
            Math.floor(projCenter.Y / 16)
        );
        const effects = proj.spriteDirection === 1
            ? Microsoft.Xna.Framework.Graphics.SpriteEffects.None
            : Microsoft.Xna.Framework.Graphics.SpriteEffects.FlipHorizontally;

        if (proj.ai.val0 === 1) {
            let launchTimer = proj.ai.val1;
            if (launchTimer > 5) launchTimer = 5;
            for (let transparency = 1; transparency >= 0; transparency -= 0.125) {
                let opacity = 1 - transparency;
                let drawAdjustment = Vector2.Multiply(proj.velocity, -launchTimer * transparency);
                let drawPos = Vector2.Add(baseDrawPos, drawAdjustment);
                let color = Color.Multiply(baseColor, opacity);
                Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)'](
                    projTexture,
                    drawPos,
                    sourceRect,
                    color,
                    proj.rotation,
                    projOrigin,
                    Vector2.new(proj.scale * 1.15, proj.scale * 1.15),
                    effects,
                    0
                );
            }
        } else {
            Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)'](
                projTexture,
                baseDrawPos,
                sourceRect,
                baseColor,
                proj.rotation,
                projOrigin,
                Vector2.new(proj.scale, proj.scale),
                effects,
                0
            );
        }

        return false;
    }
}