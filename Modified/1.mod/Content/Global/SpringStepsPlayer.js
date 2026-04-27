import { Terraria } from "../../TL/ModImports.js";
import { ModPlayer } from "../../TL/ModPlayer.js";
import { Color } from "../../TL/Modules/Color.js";
import { Effects } from "../../TL/Modules/Effects.js";

export class SpringStepsPlayer extends ModPlayer {
    constructor() {
        super();
        this.SpringStepsEquipped = false;
        this.jumps = 0;
        this.allowJump = true;
    }

    ResetEffects(player) {
        this.SpringStepsEquipped = false;
    }

    PostUpdate(player) {
        if (!this.SpringStepsEquipped) return;

        if (player.velocity.Y < 0 && this.allowJump) {
            this.allowJump = false;
            this.jumps++;
            for (let i = 0; i < 5; i++) {
                Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.2);
            }
        }

        if (player.velocity.Y > 0 || player.sliding || player.justJumped) {
            this.allowJump = true;
        }

        if (this.jumps >= 3) {
            for (let i = 0; i < 20; i++) {
                Terraria.Dust.NewDust(player.position, player.width, player.height, 6, 0, 0, 0, Color.OrangeRed, 1.5);
            }
            Effects.PlaySound(Terraria.ID.SoundID.Item74, player.Center.x, player.Center.y);
            this.jumps = 0;
        }
    }
}