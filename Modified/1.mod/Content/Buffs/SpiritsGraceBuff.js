import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';
import { Color } from '../../TL/Modules/Color.js';

const { Main } = Terraria

export class SpiritsGraceBuff extends ModBuff {
    constructor() {
        super();
        this.Texture = 'Buffs/' + this.constructor.name;
    }

    UpdatePlayer(player, buffIndex) {
        player.moveSpeed += 0.2;
        player.maxRunSpeed += 1.5;
        player.runAcceleration += 0.1;

        const dust = Terraria.Dust.NewDust(
             Vector2.new(
                player.Center.X - 2,
                player.Center.Y + player.height - 2
            ),
            player.width + 4,
            4,
            57,
            0,
            0,
            200,
            Color.White,
            1.5
        );

        Main.dust[dust].noGravity = true;
        Main.dust[dust].noLight = true;
        Main.dust[dust].velocity = Vector2.Zero;
    }

    ApplyPlayer(player) {
        player.immuneTime = 110
        player.immune = true
    }
}