import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

const FOLLOW_GAP = 85;
const FLY_DISTANCE = 500;
const TELEPORT_DISTANCE = 2000;
const FLY_EXIT_RANGE = 200;
const FLY_SPEED = 10;
const FLY_HOLD_RANGE = 60;
const VERTICAL_FLY_TRIGGER = 300;

const WALK_ACCEL = 0.075;
const WALK_MAX = 3.5;
const SPEED_CAP = 75;
const GRAVITY = 0.4;
const FALL_CAP = 10;

export class GroundPetProjectile extends ModProjectile {
    get BuffName() {
        return null;
    }

    get FlyAccel() {
        return 0.25;
    }

    get IdleFrame() {
        return 0;
    }

    get FallFrame() {
        return 0;
    }

    get WalkFrameMin() {
        return 0;
    }

    get WalkFrameMax() {
        return 0;
    }

    get FlyFrameMin() {
        return 0;
    }

    get FlyFrameMax() {
        return 0;
    }

    get FlyFrameRate() {
        return 4;
    }

    get WalkFrameRate() {
        return 6;
    }

    get IdleFrameRate() {
        return 6;
    }

    constructor() {
        super();
        this.buffType = 0;
    }

    SetDefaults() {
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.manualDirectionChange = true;
        this.Projectile.netImportant = true;
        this.Projectile.timeLeft = 18000;
    }

    OnSpawn(proj) {
        const ai = new ProjAI(proj, false);
        ai[0] = 0;
        ai[1] = 0;
    }

    FlyEffects(proj) {
    }

    WalkEffects(proj) {
    }

    IdleFrames(proj) {
        if (proj.frame > this.IdleFrame) {
            proj.frameCounter += 2;
            if (proj.frameCounter > this.IdleFrameRate) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= this.WalkFrameMax) proj.frame = this.IdleFrame;
            return;
        }
        proj.frame = this.IdleFrame;
        proj.frameCounter = 0;
    }

    AI(proj) {
        if (!this.buffType && this.BuffName) this.buffType = ModBuff.getTypeByName(this.BuffName);

        const player = Main.player[proj.owner];
        if (!player.active) {
            proj.active = false;
            return;
        }
        if (!player.dead && this.buffType && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        const ai = new ProjAI(proj, false);
        const playerX = player.Center.X;
        const selfX = proj.Center.X;

        const moveLeft = playerX < selfX - FOLLOW_GAP;
        const moveRight = playerX > selfX + FOLLOW_GAP;

        this.CheckFlyTrigger(proj, player, ai);

        if (ai[0] !== 0) this.FlyToPlayer(proj, player, ai);
        else this.WalkToPlayer(proj, player, moveLeft, moveRight);
    }

    CheckFlyTrigger(proj, player, ai) {
        if (ai[1] !== 0) return;
        if (player.rocketDelay2 > 0) ai[0] = 1;

        const dx = player.Center.X - proj.Center.X;
        const dy = player.Center.Y - proj.Center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > TELEPORT_DISTANCE) {
            proj.Center = player.Center;
            return;
        }
        if (dist > FLY_DISTANCE || Math.abs(dy) > VERTICAL_FLY_TRIGGER) ai[0] = 1;
    }

    FlyToPlayer(proj, player, ai) {
        proj.tileCollide = false;

        const dx = player.Center.X - proj.Center.X;
        const dy = player.Center.Y - proj.Center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const grounded = player.velocity.Y === 0;
        const above = proj.position.Y + proj.height <= player.position.Y + player.height;
        if (dist < FLY_EXIT_RANGE && grounded && above
            && !SolidCollision(proj.position, proj.width, proj.height)) {
            ai[0] = 0;
            if (proj.velocity.Y < -6) proj.velocity = Vector2.new(proj.velocity.X, -6);
        }

        let targetX, targetY;
        if (dist < FLY_HOLD_RANGE) {
            targetX = proj.velocity.X;
            targetY = proj.velocity.Y;
        } else {
            const scale = FLY_SPEED / dist;
            targetX = dx * scale;
            targetY = dy * scale;
        }

        const accel = this.FlyAccel;
        let vx = proj.velocity.X;
        let vy = proj.velocity.Y;

        if (vx < targetX) { vx += accel; if (vx < 0) vx += accel * 1.5; }
        if (vx > targetX) { vx -= accel; if (vx > 0) vx -= accel * 1.5; }
        if (vy < targetY) { vy += accel; if (vy < 0) vy += accel * 1.5; }
        if (vy > targetY) { vy -= accel; if (vy > 0) vy -= accel * 1.5; }

        proj.velocity = Vector2.new(vx, vy);

        proj.frameCounter++;
        if (proj.frameCounter > this.FlyFrameRate) {
            proj.frame++;
            proj.frameCounter = 0;
        }
        if (proj.frame < this.FlyFrameMin || proj.frame > this.FlyFrameMax) proj.frame = this.FlyFrameMin;

        proj.direction = vx > 0 ? 1 : -1;
        proj.spriteDirection = proj.direction === 1 ? -1 : 1;

        this.FlyEffects(proj);
    }

    WalkToPlayer(proj, player, moveLeft, moveRight) {
        proj.tileCollide = true;
        proj.rotation = 0;

        let vx = proj.velocity.X;

        if (moveLeft) {
            vx -= vx > -WALK_MAX ? WALK_ACCEL : WALK_ACCEL * 0.25;
        } else if (moveRight) {
            vx += vx < WALK_MAX ? WALK_ACCEL : WALK_ACCEL * 0.25;
        } else {
            vx *= 0.9;
            if (vx >= -WALK_ACCEL && vx <= WALK_ACCEL) vx = 0;
        }

        let blocked = false;
        if (moveLeft || moveRight) {
            let tx = (proj.Center.X / 16) | 0;
            const ty = (proj.Center.Y / 16) | 0;
            tx += moveLeft ? -1 : 1;
            if (MiscHelper.SolidTileAt(tx + (vx | 0), ty)) blocked = true;
        }

        const playerBelow = player.position.Y + player.height - 8 > proj.position.Y + proj.height;

        proj.velocity = Vector2.new(vx, proj.velocity.Y);
        Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height,
            proj.stepSpeed, proj.gfxOffY, 1, false, 0);
        vx = proj.velocity.X;
        let vy = proj.velocity.Y;

        if (vy === 0 && blocked && !playerBelow) {
            const tx = ((proj.Center.X / 16) | 0) + (moveLeft ? -1 : 1) + (vx | 0);
            const ty = (proj.Center.Y / 16) | 0;
            if (!MiscHelper.SolidTileAt(tx, ty - 1) && !MiscHelper.SolidTileAt(tx, ty - 2)) vy = -5.1;
            else if (!MiscHelper.SolidTileAt(tx, ty - 2)) vy = -7.1;
            else if (MiscHelper.SolidTileAt(tx, ty - 5)) vy = -11.1;
            else if (MiscHelper.SolidTileAt(tx, ty - 4)) vy = -10.1;
            else vy = -9.1;
        }

        if (vx > SPEED_CAP) vx = SPEED_CAP;
        if (vx < -SPEED_CAP) vx = -SPEED_CAP;

        if (vx !== 0) proj.direction = vx > 0 ? 1 : -1;
        if (vx > WALK_ACCEL && moveRight) proj.direction = 1;
        if (vx < -WALK_ACCEL && moveLeft) proj.direction = -1;
        proj.spriteDirection = proj.direction === 1 ? -1 : 1;

        this.WalkFrames(proj, vx, vy);

        vy += GRAVITY;
        if (vy > FALL_CAP) vy = FALL_CAP;
        proj.velocity = Vector2.new(vx, vy);
    }

    WalkFrames(proj, vx, vy) {
        if (vy !== 0) {
            proj.frameCounter = 0;
            proj.frame = this.FallFrame;
            return;
        }

        if (vx === 0) {
            this.IdleFrames(proj);
            return;
        }

        if (vx < -0.8 || vx > 0.8) {
            proj.frameCounter += Math.abs(vx * 0.75) | 0;
            proj.frameCounter++;
            if (proj.frameCounter > this.WalkFrameRate) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= this.WalkFrameMax || proj.frame < this.WalkFrameMin) proj.frame = this.WalkFrameMin;
            this.WalkEffects(proj);
            return;
        }

        if (proj.frame > this.IdleFrame) {
            proj.frameCounter += 2;
            if (proj.frameCounter > this.WalkFrameRate) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= this.WalkFrameMax) proj.frame = this.IdleFrame;
            return;
        }

        proj.frame = this.IdleFrame;
        proj.frameCounter = 0;
    }
}
