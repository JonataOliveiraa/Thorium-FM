import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ThePillPro } from './ThePillPro.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const FRAMES = 1;
const PICKUP_RANGE_SQ = 900;
const RECOVERY_TIME = 300;

const RING_DUST = 74;
const RING_COUNT = 25;
const RING_RADIUS = 10;
const RING_ALPHA = 175;
const RING_SPEED = 0.5;

let _recoveryBuff = -1;

export class ThePillPro2 extends ThePillPro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        super.SetDefaults();
        this.Projectile.friendly = false;
    }

    AI(proj) {
        this.Bounce(proj);
        proj.frame = 0;

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) return;
        if (player.DistanceSQ(proj.Center) >= PICKUP_RANGE_SQ) return;

        this.Deliver(proj, player);
    }

    Deliver(proj, player) {
        if (_recoveryBuff === -1) _recoveryBuff = ModBuff.getTypeByName('LifeRecoveryBuff') ?? -2;
        if (_recoveryBuff > 0) player.AddBuff(_recoveryBuff, RECOVERY_TIME, false);

        PlaySound(Terraria.ID.SoundID.Item4, proj.Center, 0, 1);

        const step = Math.PI * 2 / RING_COUNT;
        for (let i = 0; i < RING_COUNT; i++) {
            const angle = i * step;
            const offX = Math.cos(angle) * RING_RADIUS;
            const offY = Math.sin(angle) * RING_RADIUS;

            const dust = Main.dust[NewDust(proj.Center, 0, 0, RING_DUST, 0, 0, RING_ALPHA, Color.White, 1)];
            if (!dust) continue;
            dust.noGravity = true;
            dust.position = Vector2.new(proj.Center.X + offX, proj.Center.Y + offY);
            dust.velocity = Vector2.new(offX / RING_RADIUS * RING_SPEED, offY / RING_RADIUS * RING_SPEED);
        }

        proj.Kill();
    }

    OnHitNPC(proj, npc) {

    }
}
