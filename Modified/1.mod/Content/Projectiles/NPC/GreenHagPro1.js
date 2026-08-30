import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Vector2 } = Modules;
const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GreenHagPro1 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
        this._trailType = -1;
        this._burstType = -1;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 44;
        this.Projectile.aiStyle = 1;
        this.Projectile.scale = 1;
        this.Projectile.tileCollide = false;
        this.Projectile.hostile = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
    }

    TrailType() {
        if (this._trailType === -1) this._trailType = ModProjectile.getTypeByName('GreenHagPro2') ?? -2;
        return this._trailType;
    }

    BurstType() {
        if (this._burstType === -1) this._burstType = ModProjectile.getTypeByName('GreenHagPro3') ?? -2;
        return this._burstType;
    }

    AI(proj) {
        if (proj.alpha < 255) proj.alpha = Math.min(255, proj.alpha + 5);

        const ai = new ProjAI(proj, false);
        ai[1]++;
        if (ai[1] < 0) return;
        ai[1] = -4;

        const trail = this.TrailType();
        if (trail <= 0 || Main.netMode === 1) return;

        const vel = proj.velocity;
        NewProjectile(null, proj.Center, Vector2.new(vel.X * 0.01, vel.Y * 0.01), trail, proj.damage, 1, proj.owner, 0, 0, 0, null);
    }

    OnKill(proj, timeLeft) {
        const burst = this.BurstType();
        if (burst <= 0 || Main.netMode === 1) return;

        const vel = proj.velocity;
        NewProjectile(null, proj.Center, Vector2.new(vel.X * 0.01, vel.Y * 0.01), burst, proj.damage, 1, proj.owner, 0, 0, 0, null);
    }

    OnHitPlayer(proj, player) {
        if (Math.random() >= 0.3333) return;
        player.AddBuff(20, 600, false);
    }
}
