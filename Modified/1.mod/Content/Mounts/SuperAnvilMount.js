import { Terraria } from './../../TL/ModImports.js';
import { ModMount } from './../../TL/ModMount.js';
import { ModBuff } from './../../TL/ModBuff.js';

const TOTAL_FRAMES = 1;

export class SuperAnvilMount extends ModMount {
    constructor() {
        super();
        this.Texture = 'Mounts/' + this.constructor.name;
    }

    SetStaticDefaults() {
        this.Data.buff = ModBuff.getTypeByName('SuperAnvilBuff');
        this.Data.spawnDust = 1;

        this.Data.heightBoost = 0;
        this.Data.fallDamage = 0;
        this.Data.runSpeed = 0.1;
        this.Data.dashSpeed = 0;
        this.Data.acceleration = 0.1;
        this.Data.jumpHeight = 0;
        this.Data.jumpSpeed = 0;
        this.Data.blockExtraJumps = true;
        this.Data.flightTimeMax = 0;
        this.Data.fatigueMax = 0;

        this.Data.totalFrames = TOTAL_FRAMES;
        this.Data.playerYOffsets = new Array(TOTAL_FRAMES).fill(0).makeGeneric('int');
        this.Data.xOffset = 0;
        this.Data.yOffset = 16;
        this.Data.playerHeadOffset = 0;
        this.Data.bodyFrame = 3;

        this.Data.standingFrameCount = 0;
        this.Data.standingFrameDelay = 0;
        this.Data.standingFrameStart = 0;

        this.Data.runningFrameCount = 0;
        this.Data.runningFrameDelay = 0;
        this.Data.runningFrameStart = 0;

        this.Data.flyingFrameCount = 0;
        this.Data.flyingFrameDelay = 0;
        this.Data.flyingFrameStart = 0;

        this.Data.inAirFrameCount = 0;
        this.Data.inAirFrameDelay = 0;
        this.Data.inAirFrameStart = 0;

        this.Data.idleFrameCount = 0;
        this.Data.idleFrameDelay = 1;
        this.Data.idleFrameStart = 0;
        this.Data.idleFrameLoop = true;

        this.Data.swimFrameCount = 0;
        this.Data.swimFrameDelay = 0;
        this.Data.swimFrameStart = 0;

        if (!Terraria.Main.dedServ) {
            this.Data.textureWidth = this.Data.frontTexture.Value.Width;
            this.Data.textureHeight = this.Data.frontTexture.Value.Height;
        }
    }
}
