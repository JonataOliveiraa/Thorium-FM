import { Rand } from '../../TL/Modules/Rand.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';
import { Modules, Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Vector2 } = Modules;
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class IncubatedSpider extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Projectile.type] = 4;
    }

    SetDefaults() {
        this.Projectile.aiStyle = 14;
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.penetrate = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.timeLeft = 200;
        this.Projectile.idStaticNPCHitCooldown = 20;
        this.Projectile.decidesManualFallThrough = true;
    }

    OnSpawn(proj) {
        const v = proj.velocity;
        v.Y = 0;
        proj.velocity = v;
        
        if (Rand.Next(3) === 0) {
            proj.timeLeft += Rand.NextInt(50, 100);
        } 
    }

    OnKill() {
        if(ThoriumPlayer.InccubatedEggCount <= 0) return ThoriumPlayer.InccubatedEggCount = 0
        ThoriumPlayer.InccubatedEggCount--
    }

    PreAI(proj) {
        proj.rotation = 0;
        proj.gfxOffY = -5;

        const v = proj.velocity;

        Terraria.Collision.StepUp(proj.position, v, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);

        let onGround = false;
        if (proj.tileCollide) {
            const groundTest = TileCollision(proj.position, Vector2.new(0, 1), proj.width, proj.height, true, true, 1, false, false, true);
            onGround = groundTest.Y === 0;
        }

        if (onGround) {
            v.Y = 0;
        } else {
            v.Y += 0.4;
            if (v.Y > 12) v.Y = 12;
        }

        let target = this.GetTarget(proj);

        if (target) {
            let dx = target.Center.X - proj.Center.X;
            if (Math.abs(dx) > 5) {
                if (dx > 0) {
                    if (v.X < 4) v.X += 0.4;
                } else {
                    if (v.X > -4) v.X -= 0.4;
                }
            } else {
                v.X *= 0.8;
            }
        } else {
            v.X *= 0.8;
        }

        if (Math.abs(v.X) < 0.075) v.X = 0;

        if (v.X !== 0) {
            proj.spriteDirection = Math.sign(v.X);
            proj.direction = proj.spriteDirection;
        }

        proj.velocity = v;

        proj.frameCounter++;
        if (proj.frameCounter >= 5) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= 4) {
                proj.frame = 0;
            }
        }

        return false;
    }

    GetTarget(proj) {
        let nearestDist = 300;
        let nearestTarget = null;
        
        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            let npc = Terraria.Main.npc[i];
            if (npc && npc.active && !npc.friendly && npc.CanBeChasedBy(proj, false)) {
                let dx = npc.Center.X - proj.Center.X;
                let dy = npc.Center.Y - proj.Center.Y;
                let dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist < nearestDist) {
                    nearestDist = dist;
                    nearestTarget = npc;
                }
            }
        }
        return nearestTarget;
    }
}