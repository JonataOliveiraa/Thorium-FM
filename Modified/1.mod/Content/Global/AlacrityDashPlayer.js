import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';
import { ThoriumPlayer } from './ThoriumPlayer.js';

const { Color, Effects, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const DOUBLE_TAP_WINDOW = 15;

const DASH_SPEED = 20;
const DASH_IMMUNE_TIME = 6;
const DASH_DUST = 174;
const DASH_DUST_COUNT = 20;
const DASH_DUST_SPREAD = 6;

const SPIRIT_MAX = 3;
const SPIRIT_INTERVAL = 180;
const SPIRIT_DUST_COUNT = 10;
const SPIRIT_DUST_SPREAD = 50;

const DIR_NONE = -1;
const DIR_DOWN = 0;
const DIR_UP = 1;
const DIR_RIGHT = 2;
const DIR_LEFT = 3;

export class AlacrityDashPlayer extends ModPlayer {
    constructor() {
        super();
        this.dashDir = DIR_NONE;
    }

    ResetEffects(player) {
        const timers = player.doubleTapCardinalTimer;

        if (player.controlDown && player.releaseDown && timers[0] < DOUBLE_TAP_WINDOW) {
            this.dashDir = DIR_DOWN;
        } else if (player.controlUp && player.releaseUp && timers[1] < DOUBLE_TAP_WINDOW) {
            this.dashDir = DIR_UP;
        } else if (player.controlRight && player.releaseRight && timers[2] < DOUBLE_TAP_WINDOW && timers[3] === 0) {
            this.dashDir = DIR_RIGHT;
        } else if (player.controlLeft && player.releaseLeft && timers[3] < DOUBLE_TAP_WINDOW && timers[2] === 0) {
            this.dashDir = DIR_LEFT;
        } else {
            this.dashDir = DIR_NONE;
        }
    }

    _generateSpirit(player) {
        if (ThoriumPlayer.alacritySpirits >= SPIRIT_MAX) {
            ThoriumPlayer.alacrityTimer = 0;
            return;
        }

        ThoriumPlayer.alacrityTimer++;
        if (ThoriumPlayer.alacrityTimer <= SPIRIT_INTERVAL) return;

        ThoriumPlayer.alacrityTimer = 0;
        ThoriumPlayer.alacritySpirits++;

        const position = player.position;
        for (let index = 0; index < SPIRIT_DUST_COUNT; index++) {
            const offsetX = Rand.Next(-SPIRIT_DUST_SPREAD, SPIRIT_DUST_SPREAD + 1);
            const offsetY = Rand.Next(-SPIRIT_DUST_SPREAD, SPIRIT_DUST_SPREAD + 1);
            const dustIndex = Effects.NewDust(
                Vector2.new(position.X + offsetX, position.Y + offsetY),
                player.width, player.height, DASH_DUST, 0, 0, 0, Color.White, 1.25
            );
            const dust = Main.dust[dustIndex];
            if (!dust) continue;

            dust.noGravity = true;
            dust.velocity = Vector2.new(-offsetX * 0.05, -offsetY * 0.05);
        }
    }

    _dash(player) {
        const position = player.position;
        Effects.PlaySound(Terraria.ID.SoundID.Item43, player.Center.X, player.Center.Y);

        for (let index = 0; index < DASH_DUST_COUNT; index++) {
            Effects.NewDust(
                position, player.width, player.height, DASH_DUST,
                Rand.Next(-DASH_DUST_SPREAD, DASH_DUST_SPREAD),
                Rand.Next(-DASH_DUST_SPREAD, DASH_DUST_SPREAD),
                0, Color.White, 1.25
            );
        }

        const velocity = player.velocity;
        if (this.dashDir === DIR_UP) velocity.Y = -DASH_SPEED;
        else if (this.dashDir === DIR_DOWN) velocity.Y = DASH_SPEED;
        else if (this.dashDir === DIR_LEFT) velocity.X = -DASH_SPEED;
        else velocity.X = DASH_SPEED;

        player.velocity = velocity;

        if (this.dashDir === DIR_LEFT) player.direction = -1;
        else if (this.dashDir === DIR_RIGHT) player.direction = 1;

        player['void SetImmuneTimeForAllTypes(int time)'](DASH_IMMUNE_TIME);

        ThoriumPlayer.alacritySpirits--;
    }

    UpdateMovement(player) {
        if (!ThoriumPlayer.accIncandescentAlacrity) {
            ThoriumPlayer.alacritySpirits = 0;
            ThoriumPlayer.alacrityTimer = 0;
            return;
        }

        this._generateSpirit(player);

        if (this.dashDir === DIR_NONE) return;
        if (ThoriumPlayer.alacritySpirits <= 0) return;
        if (player.mount.Active) return;

        this._dash(player);
    }
}
