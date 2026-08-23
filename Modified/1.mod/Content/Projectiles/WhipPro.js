import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Vector2 } = Modules;

const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];

export class WhipPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Empty';
    }
    
    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load('Textures/Projectiles/WhipPro_Chain.png');
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 20;
        this.Projectile.melee = true;
        this.Projectile.scale = 1.0;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.extraUpdates = 1;
        this.Projectile.aiStyle = -1;
        this.Projectile.drawLayer = 7;
    }
    
    AI(proj) {
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
        const player = Terraria.Main.player[proj.owner];
        player.heldProj = proj.whoAmI;
        const ai = new ProjAI(proj);
        if (ai[0] === 0) {
            ai[1]++;
            if (ai[1] > 12) {
                ai[0] = 1;
                ai[1] = 0;
                proj.netUpdate = true;
            }
        } else {
            proj.tileCollide = false;
            let num1 = 25, num2 = 5;
            let vector2 = proj.Center;
            let num3 = player.Center.X - vector2.X;
            let num4 = player.Center.Y - vector2.Y;
            let num5 = Math.sqrt(num3 * num3 + num4 * num4);
            if (num5 > 3000.0) {
                proj.Kill();
            }
            if (num5 > 0) {
                num5 = num1 / num5;
            }
            let num6 = num3 * num5;
            let num7 = num4 * num5;
            const v = proj.velocity;
            if (v.X < num6) {
                v.X = v.X + num2;
                if ( v.X < 0.0 &&  num6 > 0.0)
                    v.X = v.X + num2;
            } else if ( v.X >  num6) {
                v.X = v.X - num2;
                if ( v.X > 0.0 &&  num6 < 0.0)
                    v.X = v.X - num2;
            }
            if ( v.Y <  num7) {
                v.Y = v.Y + num2;
                if ( v.Y < 0.0 &&  num7 > 0.0)
                    v.Y = v.Y + num2;
            } else if ( v.Y >  num7) {
                v.Y = v.Y - num2;
                if ( v.Y > 0.0 &&  num7 < 0.0)
                    v.Y = v.Y - num2;
            }
            proj.velocity = v;
            if (Terraria.Main.myPlayer === proj.owner) {
                if (proj.getRect()['bool Intersects(Rectangle rect)'](player.getRect())) {
                    proj.Kill();
                    return;
                }
            }
        }
        // ???
        /*if (ai[0] === 0) {
            const velocity = proj.velocity;
            velocity.Normalize();
        }
        const vector2_1 = Vector2.Subtract(proj.Center, player.Center);
        vector2_1.Normalize();*/
    }
    
    OnTileCollide(proj) {
        const ai = new ProjAI(proj);
        ai[1] = 20;
        proj.position = proj.oldPosition;
        proj.velocity = Vector2.Zero;
        return false;
    }
    
    DrawChain(projectile, to, texture2D) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        const screenPos = Terraria.Main.screenPosition;
        let vector2_1 = projectile.Center;
        let vector2_2 = Vector2.new(texture2D.Width * 0.5, texture2D.Height * 0.5);
        const height = texture2D.Height;
        let vector2_3 = Vector2.Subtract(to, vector2_1);
        let num = Math.atan2(vector2_3.Y, vector2_3.X) - 1.57;
        let flag = true;
        if (Number.isNaN(vector2_1.X) || Number.isNaN(vector2_1.Y)) {
            flag = false;
        }
        if (Number.isNaN(vector2_3.X) || Number.isNaN(vector2_3.Y)) {
            flag = false;
        }
        while (flag) {
            if (vector2_3['float Length()']() < height + 1) {
                flag = false;
                break;
            }
            const vector2_4 = vector2_3;
            vector2_4['void Normalize()']();
            vector2_1 = Vector2.Add(vector2_1, Vector2.Multiply(vector2_4, height));
            vector2_3 = Vector2.Subtract(to, vector2_1);
            const color = GetColor(Math.floor(vector2_1.X / 16), Math.floor(vector2_1.Y / 16));
            Draw(texture2D, Vector2.Subtract(vector2_1, screenPos), null, color, num, vector2_2, 1, null, 0);
        }
    }
    
    PreDraw(proj, lightColor) {
        this.DrawChain(proj, Terraria.Main.player[proj.owner].MountedCenter, this.ChainTexture);
        return false;
    }
}