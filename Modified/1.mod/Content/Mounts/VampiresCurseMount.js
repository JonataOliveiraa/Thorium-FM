import { Terraria } from '../../TL/ModImports.js';
import { ModMount } from '../../TL/ModMount.js';
import { ModBuff } from '../../TL/ModBuff.js';

const TOTAL_FRAMES = 8;

export class VampiresCurseMount extends ModMount {
    constructor() {
        super();
        this.Texture = 'Mounts/' + this.constructor.name;
        this.hideEntirePlayer = true;
    }

    SetStaticDefaults() {
        this.Data.buff = ModBuff.getTypeByName('VampiresCurseBuff');
        this.Data.spawnDust = 5;

        const Sets = Terraria.ID.MountID.Sets;
        Sets.PlayerIsHidden[this.Type] = true;      // so o morcego aparece
        Sets.DontHoldItems[this.Type] = true;
        Sets.CanUseHooks[this.Type] = false;
        Sets.CanDash[this.Type] = false;
        Sets.DontDismountWhenCCed[this.Type] = true;

        this.Data.heightBoost = -16;
        this.Data.fallDamage = 0.0;
        this.Data.runSpeed = 6;
        this.Data.dashSpeed = 6;
        this.Data.flightTimeMax = 300;
        this.Data.fatigueMax = 1;
        this.Data.jumpHeight = 15;
        this.Data.jumpSpeed = 5;
        this.Data.acceleration = 0.35;
        this.Data.blockExtraJumps = false;
        this.Data.constantJump = false;

        this.Data.totalFrames = TOTAL_FRAMES;
        this.Data.playerYOffsets = new Array(TOTAL_FRAMES).fill(0).makeGeneric('int');
        this.Data.xOffset = 0;
        this.Data.yOffset = 4;
        this.Data.bodyFrame = 0;
        this.Data.playerHeadOffset = 0;

        this.Data.standingFrameCount = 1;
        this.Data.standingFrameDelay = 0;
        this.Data.standingFrameStart = 0;

        this.Data.runningFrameCount = 4;
        this.Data.runningFrameDelay = 15;
        this.Data.runningFrameStart = 0;

        this.Data.flyingFrameCount = 4;
        this.Data.flyingFrameDelay = 5;
        this.Data.flyingFrameStart = 4;

        this.Data.inAirFrameCount = 4;
        this.Data.inAirFrameDelay = 5;
        this.Data.inAirFrameStart = 4;

        this.Data.idleFrameCount = 1;
        this.Data.idleFrameDelay = 1;
        this.Data.idleFrameStart = 0;
        this.Data.idleFrameLoop = true;

        this.Data.swimFrameCount = this.Data.inAirFrameCount;
        this.Data.swimFrameDelay = this.Data.inAirFrameDelay;
        this.Data.swimFrameStart = this.Data.inAirFrameStart;

        if (!Terraria.Main.dedServ && this.Data.backTexture) {
            this.Data.textureWidth = this.Data.backTexture.Value.Width;
            this.Data.textureHeight = this.Data.backTexture.Value.Height;
        }
    }

    // Vira morcego: some com o corpo e com o visual de equipamentos
    UpdateEffects(mount, player) {
        if (player.hideVisibleAccessory) {
            for (let i = 0; i < player.hideVisibleAccessory.length; i++) {
                player.hideVisibleAccessory[i] = true;
            }
        }

        player.head = 0;
        player.body = 0;
        player.legs = 0;
    }

    Draw() {
        this.hideEntirePlayer = true;
        return true;
    }
}
