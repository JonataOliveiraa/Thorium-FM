import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Color, Effects, Vector2 } = Modules;
const { Main } = Terraria;

export class JellyBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.buffNoSave[this.Type] = true;
    }

    UpdatePlayer(player, buffIndex) {
        player.lifeRegen += 5;

        if (Math.random() >= 0.12) return;
        const dust = Main.dust[Effects.NewDust(
            player.position, player.width, player.height, 1,
            0, 0.5, 150, Color.new(169, 255, 59), 0.8
        )];
        if (!dust) return;
        dust.velocity = Vector2.new(dust.velocity.X * 0.3, Math.abs(dust.velocity.Y) * 0.4 + 0.3);
    }
}
