import { Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Main } = Terraria;
const { ProjectileID } = Terraria.ID;

export class LittleNecromancer extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._buffType = -1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 10;
        Main.projPet[this.Type] = true;

        ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = ProjectileID.Sets.SimpleLoop(
            0, 5, 4, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -8, 0
        ).WithSpriteDirection(1);
    }

    SetDefaults() {
        this.CloneDefaults(398);
        this.AIType = 398;
        this.Projectile.width = 46;
        this.Projectile.height = 42;
        this.Projectile.netImportant = true;
    }

    BuffType() {
        if (this._buffType === -1) this._buffType = ModBuff.getTypeByName('LittlePhylacteryBuff') ?? -2;
        return this._buffType;
    }

    PreAI(proj) {
        Main.player[proj.owner].miniMinotaur = false;
        return true;
    }

    AI(proj) {
        const buff = this.BuffType();
        if (buff <= 0) return;

        const player = Main.player[proj.owner];
        if (!player.dead && player.FindBuffIndex(buff) >= 0) proj.timeLeft = 2;
    }
}
