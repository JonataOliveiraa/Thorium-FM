import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const LIFETIME = 120;

const TRAIL_AFTER = 118;

const DUST_BLOOD = 5;
const TRAIL_DUST_COUNT = 2;
const TRAIL_DUST_ALPHA = 200;
const TRAIL_DUST_SCALE = 1.25;
const TRAIL_DUST_DRAG = 0.2;
const CORE_DUST_SCALE = 1;

const KILL_DUST_COUNT = 15;
const KILL_DUST_SPEED = 3;
const KILL_DUST_ALPHA = 150;
const KILL_DUST_SCALE = 1.25;

export class BleedingHeartStaffPro2 extends ModProjectile {
    constructor() {
        super();

        this.Texture = 'Projectiles/Empty';
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.SentryShot[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 12;
        this.Projectile.height = 12;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = LIFETIME;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.extraUpdates = 2;
    }

    Colliding(proj, myRect, targetRect) {
        const index = new ProjAI(proj, false)[0] | 0;
        const npc = Main.npc[index];
        if (!npc || !npc.active) return false;

        if (targetRect.Width !== npc.width || targetRect.Height !== npc.height) return false;
        if (targetRect.X !== Math.trunc(npc.position.X)) return false;
        if (targetRect.Y !== Math.trunc(npc.position.Y)) return false;

        return null;
    }

    AI(proj) {
        const local = new ProjAI(proj, true);
        if (local[0] === 0) {
            local[0] = 1;
            PlaySound(Terraria.ID.SoundID.NPCHit20, proj.Center, 0, 1);
        }

        if (proj.timeLeft >= TRAIL_AFTER) return;

        for (let i = 0; i < TRAIL_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, DUST_BLOOD,
                0, 0, TRAIL_DUST_ALPHA, Color.Transparent, TRAIL_DUST_SCALE
            );
            if (!dust) continue;
            dust.velocity = Vector2.Multiply(dust.velocity, TRAIL_DUST_DRAG);
            dust.noGravity = true;
        }

        const core = NewDustDirect(
            proj.position, proj.width, proj.height, DUST_BLOOD,
            0, 0, TRAIL_DUST_ALPHA, Color.Transparent, CORE_DUST_SCALE
        );
        if (core) {
            core.position = Vector2.new(proj.Center.X, proj.Center.Y);
            core.velocity = Vector2.Zero;
            core.noGravity = true;
        }
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < KILL_DUST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.Center, proj.width, proj.height, DUST_BLOOD,
                Rand.NextFloat(-KILL_DUST_SPEED, KILL_DUST_SPEED),
                Rand.NextFloat(-KILL_DUST_SPEED, KILL_DUST_SPEED),
                KILL_DUST_ALPHA, Color.Transparent, KILL_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
