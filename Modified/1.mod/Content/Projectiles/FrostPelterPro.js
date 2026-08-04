import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const TRAIL = 10;          // quadros de rastro guardados
const DRAG = 0.95;         // a bola vai perdendo forca no ar
const SHRINK_AFTER = 130;  // depois disso ela derrete
const SHRINK_RATE = 0.05;
const MIN_SCALE = 0.2;
const FROSTBURN_CHANCE = 3; // 1 em 3

export class FrostPelterPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = TRAIL;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.ranged = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 60;
    }

    // ai[1] conta a idade da bola
    AI(proj) {
        const vel = proj.velocity;

        proj.rotation += Math.sqrt(vel.X * vel.X + vel.Y * vel.Y) * 0.2;
        proj.velocity = Vector2.new(vel.X * DRAG, vel.Y * DRAG);

        const ai = new ProjAI(proj, false);
        ai[1] = ai[1] + 1;
        if (ai[1] <= SHRINK_AFTER) return;

        proj.scale -= SHRINK_RATE;
        if (proj.scale > MIN_SCALE) return;

        proj.scale = MIN_SCALE;
        proj.Kill();
    }

    OnTileCollide(proj, hitDirection) {
        SoundHelper.play(['Item51', 'Item27'], proj.position.X, proj.position.Y);
        return true;
    }

    OnHitNPC(proj, npc) {
        SoundHelper.play(['Item51', 'Item27'], proj.position.X, proj.position.Y);
        if (Rand.Next(FROSTBURN_CHANCE) !== 0) return;
        npc.AddBuff(Terraria.ID.BuffID.Frostburn, 60, false);
    }

    // Rastro: as copias antigas vao encolhendo e escurecendo
    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return true;

        const oldPos = proj.oldPos;
        const count = Math.min(TRAIL, oldPos.Length);
        const originX = (texture.Width - proj.width) * 0.5 + proj.width * 0.5;
        const originY = proj.height / 2;
        const origin = Vector2.new(originX, originY);
        const base = proj.GetAlpha(lightColor);

        for (let i = 0; i < count; i++) {
            const fade = (count - 1 - i) / (count - 1);

            Main.spriteBatch[DRAW](
                texture,
                Vector2.new(
                    oldPos.get_Item(i).X - Main.screenPosition.X + originX,
                    oldPos.get_Item(i).Y - Main.screenPosition.Y + originY + proj.gfxOffY
                ),
                null,
                Color.new(base.R * fade | 0, base.G * fade | 0, base.B * fade | 0, base.A * fade | 0),
                proj.rotation, origin, fade * proj.scale,
                SpriteEffects.None, 0
            );
        }

        return true;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 16, 2, 1, 75);
    }
}
