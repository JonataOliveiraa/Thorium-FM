import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ThoriumPlayer } from "../Global/ThoriumPlayer.js";

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const SYMPHONIC_BONUS = 0.15;

const DUST_NOTE = 110;
const DUST_CHANCE = 3;
const DUST_ALPHA = 100;
const DUST_SCALE = 2;
const DUST_DRIFT = 0.2;
const DUST_SPEED_UP = 1.5;
const DUST_RISE = 0.65;

export class AudioOverloadBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        ThoriumPlayer.class.Bard.multiplier += SYMPHONIC_BONUS;

        if (Math.random() >= 1 / DUST_CHANCE) return;

        const vel = player.velocity;
        const dust = Main.dust[Effects.NewDust(
            Vector2.new(player.position.X - 2, player.position.Y - 2),
            player.width, player.height, DUST_NOTE,
            vel.X * DUST_DRIFT, vel.Y * DUST_DRIFT,
            DUST_ALPHA, Color.White, DUST_SCALE
        )];
        if (!dust) return;

        dust.noGravity = true;
        dust.velocity = Vector2.new(
            dust.velocity.X * DUST_SPEED_UP,
            dust.velocity.Y * DUST_SPEED_UP - DUST_RISE
        );
    }
}
