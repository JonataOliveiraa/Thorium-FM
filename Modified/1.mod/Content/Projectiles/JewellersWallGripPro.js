import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Main } = Terraria;
const { MathHelper, Vector2 } = Modules;

const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];

const CHAIN_PATH = 'Textures/Projectiles/JewellersWallGripPro_Chain.png';
const CHAIN_GAP = 20;

export class JewellersWallGripPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ProjectileID.GemHookDiamond);
        this.Projectile.width = 20;
        this.Projectile.height = 16;
        this.Projectile.netImportant = true;
        this.Projectile.aiStyle = 7;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft *= 10;
        this.AIType = Terraria.ID.ProjectileID.GemHookDiamond;
    }

    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load(CHAIN_PATH);
        this.GrappleRange = 475;
        this.NumGrappleHooks = 2;
        this.GrappleRetreatSpeed = 15;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        const player = Main.player[proj.owner];

        if (ai[0] === 0) {
            if (player.Distance(proj.Center) > this.GrappleRange) ai[0] = 1;
            return;
        }

        if (ai[0] === 1) {
            const toPlayer = Vector2.Subtract(player.MountedCenter, proj.Center);
            const dist = toPlayer['float Length()']();
            if (dist > 0) {
                const scale = this.GrappleRetreatSpeed / dist;
                proj.velocity = Vector2.new(toPlayer.X * scale, toPlayer.Y * scale);
            }
        }
    }

    UseGrapple(player, type) {
        if (player.ownedProjectileCounts[type] >= this.NumGrappleHooks) {
            const projArr = Main.projectile;
            let oldestHook = null;
            for (let i = 0; i < Main.maxProjectiles; i++) {
                const proj = projArr[i];
                if (proj && proj.active && proj.type === type && proj.owner === player.whoAmI
                    && (!oldestHook || proj.timeLeft < oldestHook.timeLeft)) oldestHook = proj;
            }
            if (oldestHook) oldestHook.Kill();
        }
        return type;
    }

    PreDraw(proj, lightColor) {
        if (!this.ChainTexture) return true;

        const screenPos = Main.screenPosition;
        const player = Main.player[Main.myPlayer];
        const playerCenter = player.MountedCenter;
        let center = proj.Center;
        let directionToPlayer = Vector2.Subtract(playerCenter, center);
        let distanceToPlayer = directionToPlayer['float Length()']();
        const chainRotation = Vector2.ToRotation(directionToPlayer) - MathHelper.PiOver2;
        const origin = Vector2.new(this.ChainTexture.Width / 2, this.ChainTexture.Height / 2);

        while (distanceToPlayer > CHAIN_GAP && !Number.isNaN(distanceToPlayer)) {
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
