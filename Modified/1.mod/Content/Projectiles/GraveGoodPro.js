import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const DUST_SPIRIT = 113;
const FRAMES = 4;
const PICKUP_RANGE_SQ = 1600;

export class GraveGoodPro extends ModProjectile {
    static _clear = Color.new(0, 0, 0, 0);

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.alpha = 100;
        this.Projectile.aiStyle = -1;
        this.Projectile.light = 0.15;
        this.Projectile.penetrate = 2;
        this.Projectile.timeLeft = 720;
        this.Projectile.tileCollide = false;
    }

    AI(proj) {
        if (Rand.NextBool()) {
            const idx = NewDust(
                proj.position, proj.width, proj.height, DUST_SPIRIT,
                proj.velocity.X * 0.1, -3, 100, GraveGoodPro._clear, 0.75
            );
            Main.dust[idx].noGravity = true;
        }

        if (++proj.frameCounter > 7) {
            proj.frameCounter = 0;
            if (++proj.frame >= FRAMES) proj.frame = 0;
        }

        // penetrate funciona como contador de uso: 2 = intacto, 1 = ja curou
        if (proj.penetrate === 1) {
            proj.Kill();
            PlaySound(Terraria.ID.SoundID.Item4, proj.Center, 0, 1);
            return;
        }

        const player = Main.LocalPlayer;
        if (!player || !player.active || player.dead) return;
        if (player.statLife >= player.statLifeMax2) return;

        const center = proj.Center;
        const target = player.Center;
        const dx = target.X - center.X;
        const dy = target.Y - center.Y;
        if (dx * dx + dy * dy >= PICKUP_RANGE_SQ) return;

        const ai = new ProjAI(proj);
        player.Heal(Math.max(1, ai[0] | 0));

        for (let i = 0; i < 15; i++) {
            const idx = NewDust(proj.position, proj.width, proj.height, DUST_SPIRIT, 0, 0, 0, GraveGoodPro._clear, 1.25);
            const dust = Main.dust[idx];
            if (!dust) continue;

            dust.noGravity = true;

            const offX = Rand.Next(-50, 51);
            const offY = Rand.Next(-50, 51);
            const pos = dust.position;
            pos.X += offX;
            pos.Y += offY;
            dust.position = pos;
            dust.velocity = Vector2.new(-offX * 0.075, -offY * 0.075);
        }

        proj.penetrate--;
    }

    OnKill(proj, timeLeft) {
        for (let i = 0; i < 15; i++) {
            const idx = NewDust(
                proj.position, proj.width, proj.height, DUST_SPIRIT,
                Rand.NextFloat(-8, 8), Rand.NextFloat(-8, 8), 0, GraveGoodPro._clear, 1
            );
            Main.dust[idx].noGravity = true;
        }
    }
}