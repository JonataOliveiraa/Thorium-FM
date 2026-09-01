import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Main } = Terraria;
const { MathHelper, Vector2 } = Modules;

const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];

export class OpalHookPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ProjectileID.GemHookDiamond);
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.aiStyle = 7;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = this.Projectile.timeLeft * 10;
        this.AIType = Terraria.ID.ProjectileID.GemHookDiamond;
    }

    SetStaticDefaults() {
        Main.projHook[this.Type] = true;
        this.ChainTexture = tl.texture.load('Textures/Projectiles/OpalHookPro_Chain.png');
        this.GrappleRange = 340;
        this.NumGrappleHooks = 1;
        this.RetreatSpeed = 12;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Main.player[proj.owner];
        const toPlayer = Vector2.Subtract(player.MountedCenter, proj.Center);
        const length = toPlayer['float Length()']();

        if (ai[0] === 0) {
            if (length > this.GrappleRange) ai[0] = 1;
        } else if (ai[0] === 1 && proj.active && length > 0) {
            proj.velocity = Vector2.Multiply(Vector2.Divide(toPlayer, length), this.RetreatSpeed);
        }
    }

    UseGrapple(player, type) {
        if (player.ownedProjectileCounts[type] >= this.NumGrappleHooks) {
            const projArr = Main.projectile;
            let oldestHook = null;
            for (let i = 0; i < 1000; i++) {
                const proj = projArr[i];
                if (proj && proj.active && proj.type === type && proj.owner === player.whoAmI && (!oldestHook || proj.timeLeft < oldestHook.timeLeft)) oldestHook = proj;
            }
            if (oldestHook) oldestHook.Kill();
        }
        return type;
    }

    PreDraw(proj, lightColor) {
        const screenPos = Main.screenPosition;
        const player = Main.player[Main.myPlayer];
        const playerCenter = player.MountedCenter;
        let center = proj.Center;
        let directionToPlayer = Vector2.Subtract(playerCenter, center);
        let distanceToPlayer = directionToPlayer['float Length()']();
        const chainRotation = Vector2.ToRotation(directionToPlayer) - MathHelper.PiOver2;
        const origin = Vector2.new(this.ChainTexture.Width / 2, this.ChainTexture.Height / 2);

        while (distanceToPlayer > 20 && !Number.isNaN(distanceToPlayer)) {
            directionToPlayer = Vector2.Divide(directionToPlayer, distanceToPlayer);
            directionToPlayer = Vector2.Multiply(directionToPlayer, this.ChainTexture.Height);
            center = Vector2.Add(center, directionToPlayer);
            directionToPlayer = Vector2.Subtract(playerCenter, center);
            distanceToPlayer = directionToPlayer['float Length()']();

            const drawColor = GetColor(center.X / 16, center.Y / 16);
            EntitySpriteDraw(this.ChainTexture, Vector2.Subtract(center, screenPos), null, drawColor, chainRotation, origin, 1.0, null, 0);
        }

        return true;
    }
}
