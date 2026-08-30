import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const CanHitLine = Terraria.Collision['bool CanHitLine(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class StrongestLinkPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.Chain = this.Texture + '_Chain';
        this.Effect = this.Texture + '_Effect';
    }
    
    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load('Textures/' + this.Chain + '.png');
        this.EffectTexture = tl.texture.load('Textures/' + this.Effect + '.png');
        this.rotVec = Vector2.new(0, 80);
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 38;
        this.Projectile.aiStyle = -1;
        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 15;
    }
    
    OnHitNPC(proj, npc) {
        npc.AddBuff(30, 60, false); // BuffID.Bleeding
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
        const vector2 = Vector2.new(proj.ai.val0, proj.ai.val1);
        this.DrawChain(proj, vector2, this.ChainTexture);
        const color = GetColor(Math.floor(vector2.X / 16), Math.floor(vector2.Y / 16));
        Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'
        ](this.EffectTexture, Vector2.Subtract(vector2, Terraria.Main.screenPosition), null, Color.op_Multiply(color, 0.8), 0, Vector2.new(8, 8), 1, null, 0);
        return true;
    }
    
    AI(proj) {
        const ai = new ProjAI(proj);
        const vector2 = Vector2.new(ai[0], ai[1]);
        let num1 = Math.floor(vector2.X / 16);
        let num2 = Math.floor(vector2.Y / 16);
        const tile = Terraria.Main.tile.get_Item(num1, num2);
        if (!tile || !tile['bool active()']()) {
            proj.Kill();
            return;
        }
        ai[2] += 0.13 * proj.spriteDirection;
        proj.Center = Vector2.Add(vector2, Vector2.RotatedBy(this.rotVec, ai[2]));
        proj.rotation += 0.13 * proj.spriteDirection;
    }
}
