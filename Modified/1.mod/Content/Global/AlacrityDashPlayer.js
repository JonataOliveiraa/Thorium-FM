import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModPlayer } from './../../TL/ModPlayer.js';
import { ThoriumPlayer } from './ThoriumPlayer.js';

const { Color, Effects, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const DOUBLE_TAP_WINDOW = 15;

const DASH_SPEED = 11;
const DASH_COOLDOWN = 90;
const DASH_IMMUNE_TIME = 6;
const DASH_DUST = 174;
const DASH_DUST_COUNT = 20;
const DASH_DUST_SPREAD = 6;

const SURGE_TIME = 300;
const SURGE_ACCELERATION = 0.25;
const SURGE_MAX_SPEED = 1.5;

const SPIRIT_MAX = 3;
const SPIRIT_INTERVAL = 180;
const SPIRIT_DUST_COUNT = 10;
const SPIRIT_DUST_SPREAD = 50;

const DIR_NONE = 0;
const DIR_RIGHT = 1;
const DIR_LEFT = -1;

export class AlacrityDashPlayer extends ModPlayer {
    constructor() {
        super();
        this.dashDir = DIR_NONE;
        this.dashCooldown = 0;
        this.surgeTimer = 0;
    }

    ResetEffects(player) {
        const timers = player.doubleTapCardinalTimer;

        if (player.controlRight && player.releaseRight && timers[2] < DOUBLE_TAP_WINDOW && timers[3] === 0) {
            this.dashDir = DIR_RIGHT;
        } else if (player.controlLeft && player.releaseLeft && timers[3] < DOUBLE_TAP_WINDOW && timers[2] === 0) {
            this.dashDir = DIR_LEFT;
        } else {
            this.dashDir = DIR_NONE;
        }
    }

    _spiritDust(player) {
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

    _generateSpirit(player) {
        if (ThoriumPlayer.alacritySpirits >= SPIRIT_MAX) {
            ThoriumPlayer.alacrityTimer = 0;
            return;
        }

        ThoriumPlayer.alacrityTimer++;
        if (ThoriumPlayer.alacrityTimer <= SPIRIT_INTERVAL) return;

        ThoriumPlayer.alacrityTimer = 0;
        ThoriumPlayer.alacritySpirits++;

        this._spiritDust(player);
        Effects.PlaySound(Terraria.ID.SoundID.Item29, player.Center.X, player.Center.Y, 1, 0.6, 0.8);
    }

    _dash(player) {
        const position = player.position;
        Effects.PlaySound(Terraria.ID.SoundID.Item43, player.Center.X, player.Center.Y, 1, 0, 1);

        for (let index = 0; index < DASH_DUST_COUNT; index++) {
            Effects.NewDust(
                position, player.width, player.height, DASH_DUST,
                Rand.Next(-DASH_DUST_SPREAD, DASH_DUST_SPREAD),
                Rand.Next(-DASH_DUST_SPREAD, DASH_DUST_SPREAD),
                0, Color.White, 1.25
            );
        }

        const velocity = player.velocity;
        velocity.X = DASH_SPEED * this.dashDir;
        player.velocity = velocity;
        player.direction = this.dashDir;

        player['void SetImmuneTimeForAllTypes(int time)'](DASH_IMMUNE_TIME);

        ThoriumPlayer.alacritySpirits--;
        this.dashCooldown = DASH_COOLDOWN;
        this.surgeTimer = SURGE_TIME;
    }

    UpdateMovement(player) {
        if (this.dashCooldown > 0) this.dashCooldown--;

        if (!ThoriumPlayer.accIncandescentAlacrity) {
            ThoriumPlayer.alacritySpirits = 0;
            ThoriumPlayer.alacrityTimer = 0;
            this.surgeTimer = 0;
            return;
        }

        this._generateSpirit(player);

        if (this.surgeTimer > 0) {
            this.surgeTimer--;
            player.runAcceleration += SURGE_ACCELERATION;
            player.maxRunSpeed += SURGE_MAX_SPEED;
        }

        if (this.dashDir === DIR_NONE) return;
        if (this.dashCooldown > 0) return;
        if (ThoriumPlayer.alacritySpirits <= 0) return;
        if (player.mount.Active) return;

        this._dash(player);
    }
}
