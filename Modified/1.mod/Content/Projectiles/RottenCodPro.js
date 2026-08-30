import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Rand, Vector2 } = Modules;

const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class RottenCodPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.Chain = this.Texture + '_Chain';
    }
    
    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load('Textures/' + this.Chain + '.png');
    }
    
    SetDefaults() {
        this.Projectile.width = this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ownerHitCheck = true;
        this.Projectile.penetrate = -1;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
        this.Projectile.drawLayer = 7;
    }
    
    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const player = Terraria.Main.player[proj.owner];
        proj.direction = player.direction;
        player.heldProj = proj.whoAmI;
        if (player.dead || player.frozen || player.itemAnimation === 2)
        {
          proj.Kill();
          if (player.itemAnimation !== 2)
            return;
          player.reuseDelay = 2;
        }
        else
        {
          if (localAI[0] > 0.0)
            --localAI[0];
          let num1 = 1.0 - player.itemAnimation / player.itemAnimationMax;
          let rotation = Vector2.ToRotation(proj.velocity);
          let num2 = proj.velocity['float Length()']();
          let num3 = 15.0;
          proj.Center = player.RotatedRelativePoint(player.MountedCenter, false, true);
          const vector2 = Vector2.Multiply(Vector2.RotatedBy(Vector2.UnitX, 3.1415927410125732 + num1 * 6.2831854820251465), Vector2.new(num2, proj.ai.val1));
          proj.position = Vector2.Add(proj.position, Vector2.Add(Vector2.RotatedBy(vector2, rotation), Vector2.RotatedBy(Vector2.new(num2 + num3, 0.0), rotation)));
          proj.rotation = Vector2.ToRotation(Vector2.Subtract(proj.Center, player.Center));
        }
    }
    
    OnHitNPC(proj, npc) {
        const player = Terraria.Main.player[proj.owner];
        const hasHit = proj.penetrate < -1;
        if (hasHit || npc.friendly || npc.damage <= 0) {
            return;
        }
        let num = 1;
        let index1 = ModProjectile.getTypeByName('HealingOrbYellow');
        if (player.ownedProjectileCounts[index1] >= 3) {
            num = 0;
        }
        const sourceOnHit = proj.GetProjectileSource_OnHit(npc, 0);
        for (let index2 = 0; index2 < num; index2++) {
            NewProjectile(sourceOnHit, npc.Center.X, npc.Center.Y, Rand.Next(-5, 5), Rand.Next(-5, 5), index1, 0, 0.0, proj.owner, 0.0, 0.0, 0.0, null);
        }
        proj.penetrate--;
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
        this.DrawChain(proj, Terraria.Main.player[proj.owner].Center, this.ChainTexture);
        return true;
    }
}