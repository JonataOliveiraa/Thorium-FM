import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModBuff } from "../../TL/ModBuff.js";

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const DUST_FIRE = 55;
const LIFE_REGEN_PENALTY = 6;

export class SingedBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = "Buffs/" + this.constructor.name;
    }

    static Damage = 3

    SetStaticDefaults() {
        Main.debuff[this.Type] = true;
        Main.pvpBuff[this.Type] = true;
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        if (player.lifeRegen > 0) player.lifeRegen = 0;
        player.lifeRegenTime = 0;
        player.lifeRegen -= LIFE_REGEN_PENALTY;

        if (Math.random() >= 0.25) return;

        const vel = player.velocity;
        const dust = Main.dust[Effects.NewDust(
            Vector2.new(player.position.X - 2, player.position.Y - 2),
            player.width, player.height + 4, DUST_FIRE,
            vel.X * 0.4, vel.Y * 0.4, 100, Color.White, 1
        )];
        if (!dust) return;

        dust.noGravity = true;
        dust.velocity = Vector2.new(dust.velocity.X * 1.6, dust.velocity.Y * 1.6 - 0.5);
    }
}
