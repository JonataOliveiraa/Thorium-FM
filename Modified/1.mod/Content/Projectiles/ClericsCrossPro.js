import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const Frame = Terraria.Utils['Rectangle Frame(Texture2D tex, int horizontalFrames, int verticalFrames, int frameX, int frameY, int sizeOffsetX, int sizeOffsetY)'];

export class ClericsCrossPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 2;
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 28;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.ownerHitCheck = true;
    }
    
    PreDraw(proj, lightColor) {
        const screenPos = Terraria.Main.screenPosition;
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const rectangle = Frame(texture, 1, Terraria.Main.projFrames[this.Type], 0, proj.frame, 0, 0);
        const drawOrigin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const offset = Vector2.new(0, proj.gfxOffY);
        const getAlpha = proj['Color GetAlpha(Color newColor)'];
        const getItem = proj.oldPos.get_Item;
        const length = proj.oldPos.Length;
        for (let index = 0; index < length; index++) {
            let drawPos = Vector2.Subtract(getItem(index), screenPos);
            drawPos = Vector2.Add(drawPos, drawOrigin);
            drawPos = Vector2.Add(drawPos, offset);
            const alpha = (length - index) / length;
            let color = Color.Multiply(getAlpha(lightColor), alpha);
            color = Color.Multiply(color, 0.5);
            EntitySpriteDraw(texture, drawPos, rectangle, color, proj.rotation, drawOrigin, proj.scale, null, 0.0);
        }
        return true;
    }
    
    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[proj.owner];
        proj.rotation += (ai[0] > 0.0) ? 0.25 : -0.25;
        ai[1]++;
        const reverse = ai[2] === 1;
        if (ai[1] >= 60 && !reverse) {
            const v = proj.velocity;
            v.X = (ai[0] > 0.0) ? -6 : 6;
            proj.velocity = v;
            proj.tileCollide = false;
            ai[2] = 1.0;
        }
        proj.frame = ThoriumPlayer.darkAura ? 1 : 0;
        if (proj.timeLeft < 30) {
            proj.alpha += 8;
            if (proj.alpha > 255) proj.alpha = 255;
        }
    }

    OnTileCollide(proj, hitDirection) {
        const ai = new ProjAI(proj);
        ai[1] = 60;
        if (proj.timeLeft > 120) {
            proj.timeLeft = 120;
        }
        return false;
    }
}