import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { SoundHelper } from './../Global/Utils/SoundHelper.js';

const { Color } = Modules;
const { Main } = Terraria;

const FRAMES = 8;
const FRAME_TIME = 1;
const SURGE_TIME = 180;

const SFX_BLAST = ['NPCDeath37', 'NPCDeath14', 'Item14'];

let _surgeType = -1;

export class EnergyExplosion extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._alpha = null;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 60;
        this.Projectile.height = 68;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.tileCollide = false;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
    }

    GetAlpha(proj, lightColor) {
        if (!this._alpha) this._alpha = Color.Multiply(Color.new(255, 255, 255, 50), 0.75);
        return this._alpha;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);

        if (localAI[0] === 0) {
            localAI[0] = 1;
            SoundHelper.play(SFX_BLAST, proj.Center.X, proj.Center.Y);
        }

        if (++proj.frameCounter <= FRAME_TIME) return;

        proj.frameCounter = 0;
        if (++proj.frame >= FRAMES) proj.Kill();
    }

    OnHitNPC(proj, npc) {
        if (_surgeType < 0) _surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
        if (_surgeType >= 0) npc.AddBuff(_surgeType, SURGE_TIME, false);
    }
}
