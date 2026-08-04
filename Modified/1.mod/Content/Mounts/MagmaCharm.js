import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModMount } from './../../TL/ModMount.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';

const { Color, Vector2 } = Modules;

export class MagmaCharm extends ModMount {
    constructor() {
        super();
        this.Texture = 'Mounts/' + this.constructor.name;
    }
    
    SetStaticDefaults() {
        this.Data.jumpHeight = 3;
        this.Data.acceleration = 0.10;
        this.Data.jumpSpeed = 3;
        this.Data.blockExtraJumps = false; 
        this.Data.constantJump = true;
        
        this.Data.heightBoost = 0; 
        this.Data.fallDamage = 0.0;
        this.Data.runSpeed = 6;
        this.Data.dashSpeed = 8;
        this.Data.flightTimeMax = 0;
        
        this.Data.fatigueMax = 0;
        this.Data.buff = ModBuff.getTypeByName('MagmaCharmBuff');
        
        this.Data.spawnDust = 35;
        
        this.Data.totalFrames = 8;
        
        const yOffset = 8; 
        this.Data.playerYOffsets = new Array(20).fill(yOffset).makeGeneric('int'); 
        
        this.Data.xOffset = 13;
        this.Data.yOffset = yOffset; 
        this.Data.playerHeadOffset = 22;
        
        this.Data.bodyFrame = 3;
        
        this.Data.standingFrameCount = 1;
        this.Data.standingFrameDelay = 12;
        this.Data.standingFrameStart = 0;
        
        this.Data.runningFrameCount = 8;
        this.Data.runningFrameDelay = 12;
        this.Data.runningFrameStart = 0;
        
        this.Data.flyingFrameCount = 0;
        this.Data.flyingFrameDelay = 0;
        this.Data.flyingFrameStart = 0;
        
        this.Data.inAirFrameCount = 1;
        this.Data.inAirFrameDelay = 12;
        this.Data.inAirFrameStart = 0;
        
        this.Data.idleFrameCount = 0;
        this.Data.idleFrameDelay = 0;
        this.Data.idleFrameStart = 0;
        this.Data.idleFrameLoop = false;
        
        this.Data.swimFrameCount = this.Data.inAirFrameCount;
        this.Data.swimFrameDelay = this.Data.inAirFrameDelay;
        this.Data.swimFrameStart = this.Data.inAirFrameStart;
        
        if (!Terraria.Main.dedServ) {
            this.Data.textureWidth = this.Data.backTexture.Value.Width + 20;
            this.Data.textureHeight = this.Data.backTexture.Value.Height;
        }
    }
    
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
    
    SetMount(mount, player) {
        for (let i = 0; i < 16; i++) {
            const dust = Terraria.Dust.NewDustPerfect(
                Vector2.Add(
                    player.Center,
                    Vector2.RotatedBy(
                        Vector2.new(80, 0),
                        i + Math.PI * 2 / 16
                    )
                ),
                mount._data.spawnDust,
                null, 0, null, 1.0
            );
            dust.noGravity = true;
        }
        return false; // Evita a poeira padrão do Terraria para usar apenas a sua
    }

    Draw() {
        this.hideEntirePlayer = true
        return true
    }
}