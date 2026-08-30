import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects, Rand, Vector2 } = Modules;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class HighTidePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 10;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
        this.AlphaColor = Color.new(255, 255, 255, 0);
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 90;
    }
    
    AI(proj) {
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
    }
    
    GetAlpha(proj, color) {
        return Color.op_Multiply(this.AlphaColor, 0.2);
    }

    PreDraw(proj, lightColor) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const screenPos = Terraria.Main.screenPosition;
        const offset = Vector2.new(0, proj.gfxOffY);
        const drawColor = Color.op_Multiply(this.AlphaColor, 0.2);
        const rotation = proj.rotation;
        const GetPos = proj.oldPos.get_Item;
        const length = proj.oldPos.Length;
    
        for (let k = 0; k < length; k++) {
            const drawPos = Vector2.Add(Vector2.Add(Vector2.Subtract(GetPos(k), screenPos), drawOrigin), offset);
            Draw(texture, drawPos, null, drawColor, rotation, drawOrigin, 0.175 * (10 - k), null, 0);
        }
    
        return true;
    }
    
    OnKill(proj, timeLeft) {
        PlaySound(Terraria.ID.SoundID.Item154, proj.position, 0, 1);
        const dustArr = Terraria.Main.dust;
        for (let i = 0; i < 20; i++) {
            const j = Terraria.Dust.NewDust(proj.position, proj.width, proj.height, 56, Rand.Next(-5, 5), Rand.Next(-5, 5), 200, null, 1.35);
            dustArr[j].noGravity = true;
        }
        if (Terraria.Main.myPlayer !== proj.owner) return;
        const sourceFromThis = proj.GetProjectileSource_FromThis();
        const num1 = proj.knockBack * 1.5;
        const num2 = ModProjectile.getTypeByName('HighTidePro2');
        NewProjectile(sourceFromThis, proj.Center, Vector2.new(7, 0), num2, proj.damage, num1, proj.owner, 0.0, 0.0, 0.0, null);
        NewProjectile(sourceFromThis, proj.Center, Vector2.new(-7, 0), num2, proj.damage, num1, proj.owner, 0.0, 0.0, 0.0, null);
    }
}

export class HighTidePro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 10; // 25 :c
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
        this.AlphaColor = Color.new(255, 255, 255, 0);
    }

    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 60;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 40;
        this.Projectile.tileCollide = false;
    }
    
    AI(proj) {
        Effects.AddLight(proj.Center, 0.1, 0.1, 0.4);
        const v = proj.velocity;
        v.X *= 0.95;
        proj.velocity = v;
        
        proj.rotation = Vector2.ToRotation(proj.velocity) + 1.57;
        
        proj.frameCounter++;
        if (proj.frameCounter > 2) {
            proj.frame++;
            proj.frameCounter = 0;
        }
        if (proj.frame < 4) return;
        proj.frame = 0;
    }
    
    GetAlpha(proj, color) {
        return Color.op_Multiply(this.AlphaColor, 0.2);
    }

    PreDraw(proj, lightColor) {
        const Draw = Terraria.Main.spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'];
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const drawOrigin = Vector2.new(texture.Width * 0.5, proj.height * 0.5);
        const screenPos = Terraria.Main.screenPosition;
        const offset = Vector2.new(0, proj.gfxOffY);
        const drawColor = Color.op_Multiply(this.AlphaColor, 0.2);
        const rotation = proj.rotation;
        const GetPos = proj.oldPos.get_Item;
        const length = proj.oldPos.Length;
    
        for (let k = 0; k < length; k++) {
            const drawPos = Vector2.Add(Vector2.Add(Vector2.Subtract(GetPos(k), screenPos), drawOrigin), offset);
            Draw(texture, drawPos, null, drawColor, rotation, drawOrigin, 0.175 * (10 - k), null, 0);
        }
    
        return true;
    }
}