import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const DUST_TYPE = 86;
const TRAIL_COUNT = 3;
const TRAIL_SCALE = 0.75;

const DEATH_DUSTS = 10;
const DEATH_SCALE = 1.25;
const DEATH_ALPHA = 150;

const CONFUSE_TIME = 60;

export class ConfusePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.magic = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 120;
        this.Projectile.tileCollide = true;
    }

    AI(proj) {
        const velocity = proj.velocity;
        proj.rotation = Vector2.ToRotation(velocity);

        for (let i = 0; i < TRAIL_COUNT; i++) {
            const index = NewDust(proj.position, proj.width, proj.height, DUST_TYPE, 0, 0, 0, Color.White, TRAIL_SCALE);
            const dust = Main.dust[index];
            if (!dust) continue;

            dust.position = Vector2.new(
                proj.Center.X - velocity.X / TRAIL_COUNT * i,
                proj.Center.Y - velocity.Y / TRAIL_COUNT * i
            );
            dust.velocity = Vector2.Zero;
            dust.noGravity = true;
        }
    }

    OnHitNPC(proj, npc) {
        npc.AddBuff(Terraria.ID.BuffID.Confused, CONFUSE_TIME, false);
    }

    OnTileCollide(proj, hitDirection) {
        PlaySound(Terraria.ID.SoundID.Item10, proj.position, 0, 1);
        return true;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < DEATH_DUSTS; i++) {
            const dust = Main.dust[NewDust(
                proj.position, proj.width, proj.height, DUST_TYPE,
                proj.velocity.X * 0.25, proj.velocity.Y * 0.25,
                DEATH_ALPHA, Color.White, DEATH_SCALE
            )];
            if (dust) dust.noGravity = true;
        }
    }
}
