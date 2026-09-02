import { Terraria } from './../../TL/ModImports.js';
import { ModMount } from './../../TL/ModMount.js';
import { ModBuff } from './../../TL/ModBuff.js';

const TOTAL_FRAMES = 8;
const PLAYER_Y_OFFSET = 32;

const RUN_SPEED = 3;
const SWIM_SPEED = 6;

export class MassiveCrabClawMount extends ModMount {
    constructor() {
        super();
        this.Texture = 'Mounts/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.Data.buff = ModBuff.getTypeByName('MassiveCrabClawBuff');
        this.Data.spawnDust = 29;

        this.Data.heightBoost = 32;
        this.Data.fallDamage = 1;
        this.Data.runSpeed = RUN_SPEED;
        this.Data.dashSpeed = 5;
        this.Data.acceleration = 0.12;
        this.Data.jumpHeight = 10;
        this.Data.jumpSpeed = 5;
        this.Data.flightTimeMax = 0;
        this.Data.fatigueMax = 0;

        this.Data.totalFrames = TOTAL_FRAMES;
        this.Data.playerYOffsets = new Array(TOTAL_FRAMES).fill(PLAYER_Y_OFFSET).makeGeneric('int');
        this.Data.xOffset = -4;
        this.Data.yOffset = 7;
        this.Data.playerHeadOffset = 38;
        this.Data.bodyFrame = 6;

        this.Data.standingFrameCount = 1;
        this.Data.standingFrameDelay = 12;
        this.Data.standingFrameStart = 0;

        this.Data.runningFrameCount = 7;
        this.Data.runningFrameDelay = 12;
        this.Data.runningFrameStart = 0;

        this.Data.flyingFrameCount = 2;
        this.Data.flyingFrameDelay = 12;
        this.Data.flyingFrameStart = 7;

        this.Data.inAirFrameCount = 1;
        this.Data.inAirFrameDelay = 12;
        this.Data.inAirFrameStart = 7;

        this.Data.idleFrameCount = 1;
        this.Data.idleFrameDelay = 12;
        this.Data.idleFrameStart = 0;
        this.Data.idleFrameLoop = true;

        this.Data.swimFrameCount = 1;
        this.Data.swimFrameDelay = 12;
        this.Data.swimFrameStart = 7;

        if (!Terraria.Main.dedServ) {
            this.Data.textureWidth = this.Data.frontTexture.Value.Width;
            this.Data.textureHeight = this.Data.frontTexture.Value.Height;
        }
    }

    UpdateEffects(mount, player) {
        this.Data.runSpeed = player.wet ? SWIM_SPEED : RUN_SPEED;
    }
}
