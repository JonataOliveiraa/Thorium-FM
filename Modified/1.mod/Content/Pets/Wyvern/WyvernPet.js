import { Terraria } from '../../../TL/ModImports.js';
import { ModBuff } from '../../../TL/ModBuff.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Main } = Terraria;

const FRAMES = 11;
const VANILLA_PUPPY = 334;

const PREVIEW_FIRST_FRAME = 1;
const PREVIEW_FRAME_COUNT = 6;
const PREVIEW_FRAME_RATE = 5;
const PREVIEW_OFFSET_X = -36;

export class WyvernPet extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Main.projPet[this.Type] = true;

        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            PREVIEW_FIRST_FRAME, PREVIEW_FRAME_COUNT,
            PREVIEW_FRAME_RATE, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            PREVIEW_OFFSET_X, 0
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        this.CloneDefaults(VANILLA_PUPPY);
        this.AIType = VANILLA_PUPPY;
        this.Projectile.width = 34;
        this.Projectile.height = 42;
    }

    PreAI(proj) {
        Main.player[proj.owner].puppy = false;
        return true;
    }

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('WyvernPetBuff');

        const player = Main.player[proj.owner];
        if (!player.active) {
            proj.active = false;
            return;
        }

        if (!player.dead && this.buffType && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;
    }
}
