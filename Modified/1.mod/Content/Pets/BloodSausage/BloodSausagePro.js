import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';
import { MiscHelper } from './../../Global/Utils/MiscHelper.js';

const { Rand, Vector2 } = Modules;
const { Main } = Terraria;

const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];

export class BloodSausagePro extends ModProjectile {
    static FOLLOW_GAP = 85;
    static FLY_DISTANCE = 500;
    static TELEPORT_DISTANCE = 1000;
    static FLY_EXIT_RANGE = 200;
    static FLY_SPEED = 10;
    static FLY_ACCEL = 0.2;
    static WALK_ACCEL = 0.075;
    static WALK_MAX = 3.5;
    static GRAVITY = 0.4;
    static FALL_CAP = 10;

    static IDLE_FRAME = 0;
    static FALL_FRAME = 2;
    static WALK_FRAME = 2;
    static FLY_FRAME = 2;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
        this.DrawOriginOffsetY = -6;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 3;
        Main.projPet[this.Type] = true;

        // Sem isto a tela de selecao de personagem trava ao tentar animar o pet.
        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            0, Main.projFrames[this.Type],
            2, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -5, -20
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        this.Projectile.width = 38;
        this.Projectile.height = 32;
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

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('BloodSausageBuff');

        const player = Main.player[proj.owner];
        if (!player.active) {
            proj.active = false;
            return;
        }
        if (!player.dead && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        const ai = new ProjAI(proj, false);
        const gap = BloodSausagePro.FOLLOW_GAP;
        const playerX = player.Center.X;
        const selfX = proj.Center.X;

        let moveLeft = playerX < selfX - gap;
        let moveRight = playerX > selfX + gap;

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

        if (dist > BloodSausagePro.TELEPORT_DISTANCE) {
            proj.Center = player.Center;
            return;
        }
        if (dist > BloodSausagePro.FLY_DISTANCE || Math.abs(dy) > 300) ai[0] = 1;
    }

    FlyToPlayer(proj, player, ai) {
        proj.tileCollide = false;

        const dx = player.Center.X - proj.Center.X;
        const dy = player.Center.Y - proj.Center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        const grounded = player.velocity.Y === 0;
        const above = proj.position.Y + proj.height <= player.position.Y + player.height;
        if (dist < BloodSausagePro.FLY_EXIT_RANGE && grounded && above
            && !SolidCollision(proj.position, proj.width, proj.height)) {
            ai[0] = 0;
            if (proj.velocity.Y < -6) proj.velocity = Vector2.new(proj.velocity.X, -6);
        }

        let targetX, targetY;
        if (dist < 60) {
            targetX = proj.velocity.X;
            targetY = proj.velocity.Y;
        } else {
            const scale = BloodSausagePro.FLY_SPEED / dist;
            targetX = dx * scale;
            targetY = dy * scale;
        }

        const accel = BloodSausagePro.FLY_ACCEL;
        let vx = proj.velocity.X;
        let vy = proj.velocity.Y;

        if (vx < targetX) { vx += accel; if (vx < 0) vx += accel * 1.5; }
        if (vx > targetX) { vx -= accel; if (vx > 0) vx -= accel * 1.5; }
        if (vy < targetY) { vy += accel; if (vy < 0) vy += accel * 1.5; }
        if (vy > targetY) { vy -= accel; if (vy > 0) vy -= accel * 1.5; }

        proj.velocity = Vector2.new(vx, vy);

        proj.frameCounter++;
        if (proj.frameCounter > 1) {
            proj.frame++;
            proj.frameCounter = 0;
        }
        if (proj.frame !== BloodSausagePro.FLY_FRAME) proj.frame = BloodSausagePro.FLY_FRAME;

        const rot = Math.atan2(vy, vx);
        proj.direction = vx > 0 ? 1 : -1;
        proj.spriteDirection = proj.direction === 1 ? -1 : 1;
        proj.rotation = proj.spriteDirection === -1 ? rot : rot + Math.PI;
    }

    WalkToPlayer(proj, player, moveLeft, moveRight) {
        proj.tileCollide = true;
        proj.rotation += proj.velocity.X * 0.08;

        const accel = BloodSausagePro.WALK_ACCEL;
        const max = BloodSausagePro.WALK_MAX;
        let vx = proj.velocity.X;

        if (moveLeft) {
            vx -= vx > -max ? accel : accel * 0.25;
        } else if (moveRight) {
            vx += vx < max ? accel : accel * 0.25;
        } else {
            vx *= 0.9;
            if (vx >= -accel && vx <= accel) vx = 0;
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

        if (vx !== 0) proj.direction = vx > 0 ? 1 : -1;
        if (vx > accel && moveRight) proj.direction = 1;
        if (vx < -accel && moveLeft) proj.direction = -1;
        proj.spriteDirection = proj.direction === 1 ? -1 : 1;

        this.WalkFrames(proj, vx, vy);

        vy += BloodSausagePro.GRAVITY;
        if (vy > BloodSausagePro.FALL_CAP) vy = BloodSausagePro.FALL_CAP;
        proj.velocity = Vector2.new(vx, vy);
    }

    WalkFrames(proj, vx, vy) {
        if (vy !== 0) {
            proj.frameCounter = 0;
            proj.frame = BloodSausagePro.FALL_FRAME;
            return;
        }

        if (vx === 0) {
            if (proj.frame > 1) {
                proj.frame = BloodSausagePro.IDLE_FRAME;
                return;
            }
            proj.frameCounter++;
            if (proj.frameCounter === 30) proj.frame++;
            if (proj.frameCounter > 40) {
                proj.frame = 0;
                proj.frameCounter = Rand.Next(-180, 0);
            }
            return;
        }

        if (vx < -0.8 || vx > 0.8) {
            proj.frameCounter += Math.abs(vx * 0.75) | 0;
            proj.frameCounter++;
            if (proj.frameCounter > 6) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame !== BloodSausagePro.WALK_FRAME) proj.frame = BloodSausagePro.WALK_FRAME;
            return;
        }

        if (proj.frame > 0) {
            proj.frameCounter += 2;
            if (proj.frameCounter > 6) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= BloodSausagePro.WALK_FRAME) proj.frame = 0;
            return;
        }

        proj.frame = BloodSausagePro.IDLE_FRAME;
        proj.frameCounter = 0;
    }
}
