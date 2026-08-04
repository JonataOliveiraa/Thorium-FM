import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;

const GRAVITY = 0.08;
const SLOW_TIME = 60; // TODO: trocar por um debuff proprio "Oozed" quando houver textura

export class SnotShot extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 300;
        this.Projectile.extraUpdates = 1;
        this.Projectile.tileCollide = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 60;
    }

    AI(proj) {
        const vel = proj.velocity;
        vel.Y += GRAVITY;
        if (vel.Y > 16) vel.Y = 16;
        proj.velocity = vel;

        proj.rotation = Math.atan2(vel.Y, vel.X) + Math.PI / 2;
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.Slow, SLOW_TIME, false);
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 4, 188, 3, 1, 0);
        FxHelper.burst(proj.position, proj.width, proj.height, 3, 256, 3, 0.8, 0);
    }
}
