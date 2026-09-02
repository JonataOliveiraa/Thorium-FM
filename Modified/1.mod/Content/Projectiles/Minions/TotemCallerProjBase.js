import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';
import { MiscHelper } from './../../Global/Utils/MiscHelper.js';

const { Effects, Vector2 } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const FRAMES = 2;
const GRAVITY = 1;
const FALL_CAP = 16;
const GROUND_SEARCH = 40;
const EMBED_LIFT = 4;

export class TotemCallerProjBase extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Minions/' + this.constructor.name;
        this.landed = false;
    }

    get LightR() { return 0; }
    get LightG() { return 0; }
    get LightB() { return 0; }
    get AttackDistance() { return 0; }
    get AttackCooldown() { return 0; }
    get AnimationSpeed() { return 8; }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        this.SafeSetStaticDefaults();
    }

    SafeSetStaticDefaults() {

    }

    SetDefaults() {
        this.Projectile.width = 34;
        this.Projectile.height = 48;
        this.Projectile.aiStyle = -1;
        this.Projectile.sentry = true;
        this.Projectile.netImportant = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.SafeSetDefaults();
    }

    SafeSetDefaults() {

    }

    OnSpawn(proj) {
        this.SnapToGround(proj);
    }

    AI(proj) {
        Effects.AddLight(proj.Center, this.LightR, this.LightG, this.LightB);

        this.Settle(proj);
        this.Attack(proj);
        this.Animate(proj);
        this.SafeAI(proj);
    }

    SafeAI(proj) {

    }

    Attack(proj) {
        const cooldown = this.AttackCooldown;
        const distance = this.AttackDistance;
        if (cooldown <= 0 || distance <= 0) return;

        const ai = new ProjAI(proj);
        ai[1]++;
        if (ai[1] < cooldown) return;

        ai[1] = 0;
        proj.frameCounter = 0;

        const target = FindTargetWithinRange(proj, distance, true);
        if (target) this.Shoot(proj, target);
    }

    Shoot(proj, target) {

    }

    Animate(proj) {
        proj.frameCounter++;
        if (proj.frameCounter <= this.AnimationSpeed) return;

        proj.frameCounter = 0;
        proj.frame = proj.frame + 1 >= FRAMES ? 0 : proj.frame + 1;
    }

    SnapToGround(proj) {
        const tileX = Math.floor(proj.Center.X / 16);
        const startY = Math.floor((proj.position.Y + proj.height) / 16);

        for (let i = -EMBED_LIFT; i < GROUND_SEARCH; i++) {
            const tileY = startY + i;
            if (!MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) continue;
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            this.landed = true;
            return;
        }
    }

    Settle(proj) {
        const vel = proj.velocity;
        if (vel.Y === 0) return;

        const vy = Math.min(vel.Y + GRAVITY, FALL_CAP);
        const tileX = Math.floor(proj.Center.X / 16);
        const tileY = Math.floor((proj.position.Y + proj.height + vy) / 16);

        if (MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) {
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.Zero;
            return;
        }

        proj.velocity = Vector2.new(vel.X, vy);
    }
}
