import { Terraria } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Main } = Terraria;

export class RottenMeatPro extends ModProjectile {
    static VANILLA_HORNET = 198;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 3;
        Main.projPet[this.Type] = true;
    }

    SetDefaults() {
        this.CloneDefaults(RottenMeatPro.VANILLA_HORNET);
        this.AIType = RottenMeatPro.VANILLA_HORNET;
    }

    PreAI(proj) {
        Main.player[proj.owner].hornet = false;
        return true;
    }

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('RottenMeatBuff');

        const player = Main.player[proj.owner];
        if (!player.dead && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        this.Animate(proj);
    }

    Animate(proj) {
        proj.frameCounter++;
        if (proj.frameCounter > 2) {
            proj.frame++;
            proj.frameCounter = 0;
        }
        if (proj.frame >= Main.projFrames[this.Type]) proj.frame = 0;
    }
}
