import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const FRAMES = 3;
const DRAG = 0.965;
const SPIN = 0.12;

const FADE_OUT_TIME = 10;
const DEATH_DUSTS = 15;
const DUST_BLOOD = 5;
const DUST_SPREAD = 3;
const DUST_SCALE = 1.75;

export class BonesawPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 28;
        this.Projectile.height = 28;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 90;
        this.Projectile.tileCollide = false;
    }

    AI(proj) {
        proj.velocity = Vector2.Multiply(proj.velocity, DRAG);
        proj.rotation += proj.velocity.X * SPIN;
        proj.spriteDirection = proj.velocity.X > 0 ? -1 : 1;

        const ai = new ProjAI(proj);
        proj.frame = Math.max(0, Math.min(ai[0] | 0, FRAMES - 1));

        if (proj.timeLeft < FADE_OUT_TIME) {
            proj.Opacity = proj.timeLeft / FADE_OUT_TIME;
        }
    }

    OnKill(proj, timeLeft) {
        PlaySound(Terraria.ID.SoundID.NPCHit13, proj.position, 0, 1);

        for (let i = 0; i < DEATH_DUSTS; i++) {
            const dust = Main.dust[NewDust(
                proj.position, 10, 10, DUST_BLOOD,
                Rand.Next(-DUST_SPREAD, DUST_SPREAD), Rand.Next(-DUST_SPREAD, DUST_SPREAD),
                125, Color.White, DUST_SCALE
            )];
            if (dust) dust.noGravity = true;
        }
    }
}
