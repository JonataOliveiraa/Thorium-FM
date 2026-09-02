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

        // Sem isto a tela de selecao de personagem trava ao tentar animar o pet.
        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            0, Main.projFrames[this.Type],
            3, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -5, -20
        ).WithSpriteDirection(-1);
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
