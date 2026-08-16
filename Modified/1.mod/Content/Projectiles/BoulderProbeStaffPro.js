import { Effects } from '../../TL/Modules/Effects.js';
import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const NEW_PROJECTILE = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const FIRE_DELAY = 45;
const MUZZLE_DISTANCE = 10;
const LASER_SPEED = 10;
const FADE_OUT_TIME = 30;

let laserType = -1;

export class BoulderProbeStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 50;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.sentry = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
    }

    GetAlpha(proj, lightColor) {
        if (proj.timeLeft > FADE_OUT_TIME) return Color.White;
        return Color.new(255, 255, 255, Math.floor(255 * (proj.timeLeft / FADE_OUT_TIME)));
    }

    _fireLaser(proj, directionX, directionY) {
        Effects.PlaySound(Terraria.ID.SoundID.Item115, proj.Center.X, proj.Center.Y);
        if (laserType < 0) laserType = ModProjectile.getTypeByName('BoulderProbeStaffProLaser') ?? -1;
        if (laserType < 0) return;

        const center = proj.Center;
        const muzzle = Vector2.new(center.X + directionX * MUZZLE_DISTANCE, center.Y + directionY * MUZZLE_DISTANCE);
        const velocity = Vector2.new(directionX * LASER_SPEED, directionY * LASER_SPEED);

        NEW_PROJECTILE(null, muzzle, velocity, laserType, proj.damage, proj.knockBack, proj.owner, 0, 0, 0, null);
    }

    AI(proj) {
        const mouse = Main.MouseWorld;
        const center = proj.Center;

        const offsetX = mouse.X - center.X;
        const offsetY = mouse.Y - center.Y;

        // A torreta acompanha o cursor em vez de mirar sozinha.
        proj.rotation = Math.atan2(offsetY, offsetX);

        const ai = new ProjAI(proj, false);
        ai[1]++;
        if (ai[1] < FIRE_DELAY) return;
        ai[1] = 0;

        const length = Math.sqrt(offsetX * offsetX + offsetY * offsetY);
        if (length === 0) return;

        this._fireLaser(proj, offsetX / length, offsetY / length);
    }
}
