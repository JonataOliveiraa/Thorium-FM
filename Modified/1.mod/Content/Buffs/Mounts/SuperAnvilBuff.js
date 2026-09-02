import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModMount } from '../../../TL/ModMount.js';
import { MiscHelper } from '../../Global/Utils/MiscHelper.js';
import { ThoriumPlayer } from '../../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const { Main } = Terraria;

const NewDustPerfect = Terraria.Dust.NewDustPerfect;
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

const BUFF_REFRESH = 10;

const EXTRA_FALL_SPEED = 25;
const THORNS_DIVISOR = 15;

const FALL_GAIN = 3;
const FALL_MAX = 120;
const FALL_IMPACT_MIN = 50;

const RING_DUST = 54;
const RING_COUNT = 30;
const RING_RADIUS_X = 30;
const RING_RADIUS_Y = 10;
const RING_SCALE = 1.35;
const RING_DROP = 12;

export class SuperAnvilBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/Mounts/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.buffNoTimeDisplay[this.Type] = true;
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.mount.SetMount(ModMount.getTypeByName('SuperAnvilMount'), player, false);
        player.buffTime[buffIndex] = BUFF_REFRESH;

        player.noFallDmg = true;
        player.noKnockback = true;
        player.maxFallSpeed += EXTRA_FALL_SPEED;

        const fallSpeed = player.velocity.Y;

        if (fallSpeed > 0) {
            player.thorns += fallSpeed / THORNS_DIVISOR;
            if (ThoriumPlayer.anvilFalling < FALL_MAX) ThoriumPlayer.anvilFalling += FALL_GAIN;
        }

        if (fallSpeed < 0) ThoriumPlayer.anvilFalling = 0;
        if (fallSpeed !== 0) return;

        if (ThoriumPlayer.anvilFalling <= FALL_IMPACT_MIN) return;
        if (!MiscHelper.IsOnStandableGround(player.position.X, player.position.Y + player.height, player.width)) return;

        if (ThoriumPlayer.anvilFalling >= FALL_MAX) this.Shockwave(player);

        PlaySound(Terraria.ID.SoundID.Item37, player.position, 0, 1);
        ThoriumPlayer.anvilFalling = 0;
    }

    Shockwave(player) {
        const center = player.Center;
        const step = Math.PI * 2 / RING_COUNT;

        for (let i = 0; i < RING_COUNT; i++) {
            const angle = i * step;
            const offX = -Math.sin(angle) * RING_RADIUS_X;
            const offY = -Math.cos(angle) * RING_RADIUS_Y;

            const dust = NewDustPerfect(center, RING_DUST, null, 0, null, 1);
            if (!dust) continue;

            dust.scale = RING_SCALE;
            dust.noGravity = true;
            dust.position = Vector2.new(center.X + offX, center.Y + offY + RING_DROP);

            const len = Math.sqrt(offX * offX + offY * offY) || 1;
            dust.velocity = Vector2.new(offX / len, offY / len);
        }
    }
}
