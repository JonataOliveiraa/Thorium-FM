import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Vector2 } = Modules;

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const CanHitLine = Terraria.Collision['bool CanHitLine(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let ScorpainProjType = -1;

export class ScorpainPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        ScorpainProjType = this.Type;
    }

    SetDefaults() {
        this.CloneDefaults(564);
        this.Projectile.width = this.Projectile.height = 16;
        this.Projectile.scale = 1.05;
        this.Projectile.aiStyle = 99; // Yoyo AI style
    }
    
    AI(proj) {
        const maxSpeed = 11;
        const acceleration = 1.05;
        
        const v = proj.velocity;
        v.X *= acceleration;
        v.Y *= acceleration;
        if (v.X > maxSpeed) v.X = maxSpeed;
        if (v.X < -maxSpeed) v.X = -maxSpeed;
        if (v.Y > maxSpeed) v.Y = maxSpeed;
        if (v.Y < -maxSpeed) v.Y = -maxSpeed;
        proj.velocity = v;
        
        if (Terraria.Main.myPlayer !== proj.owner || proj.frameCounter >= 1) {
            return;
        }
        
        NewProjectile(proj.GetProjectileSource_FromThis(), proj.Center, Vector2.Zero, ModProjectile.getTypeByName('ScorpainPro2'), Math.floor(proj.damage * 1.25), proj.knockBack, proj.owner, 0, proj.whoAmI, 0, null);
        
        proj.frameCounter++;
    }
}


export class ScorpainPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.Chain = this.Texture + '_Chain';
    }
    
    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load('Textures/' + this.Chain + '.png');
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 26;
        this.Projectile.aiStyle = -1;
        this.Projectile.melee = true;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 60;
    }
    
    Colliding(proj, myRect, targetRect) {
        return !this.ParentHasLOSTo(proj, targetRect) ? false : null;
    }
    
    ParentHasLOSTo(proj, targetHitbox) {
        const ParentIndex = proj.ai.val1;
        if (ParentIndex <= -1 || ParentIndex > Terraria.Main.maxProjectiles) {
            return false;
        }
        const projectile = Terraria.Main.projectile[ParentIndex];
        if (targetHitbox.DistanceSQ(proj.Center) > 1000000.0) {
            return false;
        }
        const player = Terraria.Main.player[proj.owner];
        return CanHit(projectile.position, projectile.width, projectile.height, Vector2.new(targetHitbox.X, targetHitbox.Y), targetHitbox.Width, targetHitbox.Height) || CanHitLine(Vector2.Add(projectile.Center, Vector2.new(projectile.direction * projectile.width / 2, player.gravDir * -projectile.height / 3)), 0, 0, Vector2.Add(Vector2.new(targetHitbox.X + targetHitbox.Width / 2, targetHitbox.Y + targetHitbox.Height / 2), Vector2.new(0, -targetHitbox.Height / 3)), 0, 0) || CanHitLine(Vector2.Add(projectile.Center, Vector2.new(projectile.direction * projectile.width / 2, player.gravDir * -projectile.height / 3)), 0, 0, Vector2.new(targetHitbox.X + targetHitbox.Width / 2, targetHitbox.Y + targetHitbox.Height / 2), 0, 0) || CanHitLine(Vector2.Add(projectile.Center, Vector2.new(projectile.direction * projectile.width / 2, 0)), 0, 0, Vector2.Add(Vector2.new(targetHitbox.X + targetHitbox.Width / 2, targetHitbox.Y + targetHitbox.Height / 2), Vector2.new(0, targetHitbox.Height / 3)), 0, 0);
    }
    
    OnHitNPC(proj, npc) {
        npc.AddBuff(20, 300, false);
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
        const ParentIndex = proj.ai.val1;
        if (ParentIndex > -1 && ParentIndex <= Terraria.Main.maxProjectiles) {
            this.DrawChain(proj, Terraria.Main.projectile[ParentIndex].Center, this.ChainTexture);
        }
        return true;
    }
    
    AI(proj) {
        const ParentIndex = proj.ai.val1;
        if (ParentIndex <= -1 || ParentIndex > Terraria.Main.maxProjectiles) {
            proj.Kill();
            return;
        }
        
        let projectile1 = Terraria.Main.projectile[ParentIndex];
        
        if (!projectile1.active || projectile1.type !== ScorpainProjType) {
            proj.Kill();
        } else {
            proj.timeLeft = 10;
            proj.spriteDirection = proj.direction;
            proj.rotation += 0.15;
        }
    }
}
