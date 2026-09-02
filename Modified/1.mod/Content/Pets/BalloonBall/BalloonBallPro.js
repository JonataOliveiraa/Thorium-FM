import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ProjAI } from '../../../TL/ProjAI.js';
import { GroundPetProjectile } from '../GroundPetProjectile.js';

const { Rand } = Modules;
const { Main } = Terraria;

const FRAMES = 11;

const IDLE_SETTLE = 300;
const IDLE_FIDGET_RATE = 12;
const IDLE_RESET_CHANCE = 8;

export class BalloonBallPro extends GroundPetProjectile {
    get BuffName() {
        return 'BalloonBallBuff';
    }

    get FlyAccel() {
        return 0.2;
    }

    get IdleFrame() {
        return 0;
    }

    get IdleFrameMax() {
        return 0;
    }

    get FallFrame() {
        return 2;
    }

    get WalkFrameMin() {
        return 1;
    }

    get WalkFrameMax() {
        return 6;
    }

    get FlyFrameMin() {
        return 7;
    }

    get FlyFrameMax() {
        return 10;
    }

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Main.projPet[this.Type] = true;

        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            this.WalkFrameMin, this.WalkFrameMax + 1 - this.WalkFrameMin,
            6, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -3, 0
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        super.SetDefaults();
        this.Projectile.width = 30;
        this.Projectile.height = 36;
    }

    OnSpawn(proj) {
        super.OnSpawn(proj);
        new ProjAI(proj, true)[0] = 0;
    }

    WalkEffects(proj) {
        new ProjAI(proj, true)[0] = 0;
    }

    IdleFrames(proj) {
        const local = new ProjAI(proj, true);
        const settled = local[0] + 1;
        local[0] = settled;

        if (settled < IDLE_SETTLE) {
            proj.frame = this.IdleFrame;
            proj.frameCounter = 0;
            return;
        }

        proj.frameCounter++;
        if (proj.frameCounter <= IDLE_FIDGET_RATE) return;

        proj.frameCounter = 0;
        proj.frame++;

        if (proj.frame <= this.IdleFrameMax) return;

        proj.frame = this.IdleFrame + 1;
        if (Rand.Next(IDLE_RESET_CHANCE) === 0) local[0] = 0;
    }
}
