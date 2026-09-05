import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;

const EntitySpriteDraw = Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class OmenPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 34;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 100;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.extraUpdates = 1;
    }
    
    GetAlpha(proj, color) {
        return Color.White;
    }
    
    OnHitNPC(proj, npc) {
        npc.AddBuff(153, 180, false);
    }

    PreDraw(proj, lightColor) {
        const screenPos = Terraria.Main.screenPosition;
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
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
            const color = Color.Multiply(getAlpha(lightColor), alpha);
            EntitySpriteDraw(texture, drawPos, null, color, proj.rotation, drawOrigin, proj.scale, null, 0.0);
        }
        return true;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[proj.owner];

        if (Rand.NextBool(2)) {
            const index = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 27, proj.velocity.X * 0.1, proj.velocity.Y * 0.1, 255, null, 1.25);
            Terraria.Main.dust[index].noGravity = true;
        }

        if (proj.damage <= 1) {
            // NOTE: SoundEngine.PlaySound sem exemplo prévio — assinatura/overload a confirmar.
            PlaySound(Terraria.ID.SoundID.Item43, proj.position, 0, 1);
            for (let index1 = 0; index1 < 25; index1++) {
                const index2 = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 27, Rand.NextFloat(-5, 5), Rand.NextFloat(-5, 5), 255, null, 1.0);
                Terraria.Main.dust[index2].noGravity = true;
            }
            proj.Kill();
            return;
        }

        if (ai[0] === 0.0) {
            ai[1]++;
            if (ai[1] >= 50.0) {
                ai[0] = 1.0;
                ai[1] = 0.0;
                proj.netUpdate = true;
            }
        } else {
            proj.tileCollide = false;
            const speed = 9.0;
            const accel = 4.0;
            const targetPos = Vector2.new(proj.position.X + proj.width * 0.75, proj.position.Y + proj.height * 0.75);
            let diffX = player.position.X + Math.floor(player.width / 5) - targetPos.X;
            let diffY = player.position.Y + Math.floor(player.height / 5) - targetPos.Y;
            let dist = Math.sqrt(diffX * diffX + diffY * diffY);
            if (dist > 3000.0) {
                proj.Kill();
            }
            if (dist > 0.0) {
                dist = speed / dist;
            }
            const targetVX = diffX * dist;
            const targetVY = diffY * dist;

            const v = proj.velocity;
            if (v.X < targetVX) {
                v.X += accel;
                if (v.X < 0.0 && targetVX > 0.0) v.X += accel;
            } else if (v.X > targetVX) {
                v.X -= accel;
                if (v.X > 0.0 && targetVX < 0.0) v.X -= accel;
            }
            if (v.Y < targetVY) {
                v.Y += accel;
                if (v.Y < 0.0 && targetVY > 0.0) v.Y += accel;
            } else if (v.Y > targetVY) {
                v.Y -= accel;
                if (v.Y > 0.0 && targetVY < 0.0) v.Y -= accel;
            }
            proj.velocity = v;

            if (Terraria.Main.myPlayer === proj.owner) {
                if (proj.getRect()['bool Intersects(Rectangle rect)'](player.getRect())) {
                    proj.Kill();
                    return;
                }
            }
        }

        proj.rotation += 0.15 * proj.direction;
    }

    OnTileCollide(proj, oldVelocity) {
        const ai = new ProjAI(proj);
        ai[0] = 1.0;
        return false;
    }
}
