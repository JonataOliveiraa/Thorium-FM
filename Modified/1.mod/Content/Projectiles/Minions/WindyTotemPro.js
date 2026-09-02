import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { MiscHelper } from './../../Global/Utils/MiscHelper.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const FRAMES = 6;
const FRAME_RATE = 3;
const FALL_SPEED = 8;
const LIFT = -8;
const SLOW_TIME = 20;
const FADE_OUT_TIME = 30;

let _slowBuff = -1;

export class WindyTotemPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Minions/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 40;
        this.Projectile.height = 42;
        this.Projectile.aiStyle = 0;
        this.Projectile.alpha = 100;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = false;
        this.AIType = 14;
    }

    AI(proj) {
        this.RideGround(proj);

        if (proj.timeLeft < FADE_OUT_TIME) {
            proj.Opacity = proj.timeLeft / FADE_OUT_TIME;
        }

        proj.frameCounter++;
        if (proj.frameCounter > FRAME_RATE) {
            proj.frameCounter = 0;
            proj.frame = proj.frame + 1 >= FRAMES ? 0 : proj.frame + 1;
        }
    }

    RideGround(proj) {
        const tileX = Math.floor(proj.Center.X / 16);
        const tileY = Math.floor((proj.position.Y + proj.height + FALL_SPEED) / 16);

        if (MiscHelper.SolidOrSolidTopTileAt(tileX, tileY)) {
            proj.position = Vector2.new(proj.position.X, tileY * 16 - proj.height);
            proj.velocity = Vector2.new(proj.velocity.X, 0);
            return;
        }

        proj.velocity = Vector2.new(proj.velocity.X, FALL_SPEED);
    }

    OnHitNPC(proj, npc) {
        if (npc.life <= 0) return;

        if (_slowBuff === -1) _slowBuff = ModBuff.getTypeByName('DistortedTimeEnemy') ?? -2;
        if (_slowBuff > 0) npc.AddBuff(_slowBuff, SLOW_TIME, false);

        npc.velocity = Vector2.new(npc.velocity.X, npc.velocity.Y + LIFT);
    }
}
