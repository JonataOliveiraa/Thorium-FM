import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const FLY_TIME = 40;
const RETURN_SPEED = 9;
const RETURN_ACCEL = 4;
const SPIN = 0.3;

export class BatScythePro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 58;
        this.Projectile.height = 58;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 20;
    }

    OnTileCollide(proj) {
        new ProjAI(proj, false)[0] = 1;
        return false;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        proj.rotation += (proj.velocity.X > 0 ? 1 : -1) * SPIN;

        if (ai[0] === 0) {
            ai[1] = ai[1] + 1;
            if (ai[1] < FLY_TIME) return;
            ai[0] = 1;
            ai[1] = 0;
            return;
        }

        // Retorno
        proj.tileCollide = false;
        proj.extraUpdates = 1;

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) {
            proj.Kill();
            return;
        }

        const center = proj.Center;
        const target = player.Center;
        const dx = target.X - center.X;
        const dy = target.Y - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist > 3000) {
            proj.Kill();
            return;
        }
        if (dist < 40) {
            proj.Kill();
            return;
        }

        const inv = dist > 0 ? RETURN_SPEED / dist : 0;
        const wantX = dx * inv;
        const wantY = dy * inv;
        const vel = proj.velocity;

        let velX = vel.X;
        let velY = vel.Y;

        if (velX < wantX) velX += RETURN_ACCEL;
        else if (velX > wantX) velX -= RETURN_ACCEL;
        if (velY < wantY) velY += RETURN_ACCEL;
        else if (velY > wantY) velY -= RETURN_ACCEL;

        proj.velocity = Vector2.new(velX, velY);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 8, 5, 3, 1.25, 125);
    }
}
