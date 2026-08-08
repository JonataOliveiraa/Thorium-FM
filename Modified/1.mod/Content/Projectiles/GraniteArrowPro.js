import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { SoundHelper } from './../Global/Utils/SoundHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const DUST_GRANITE = 59;
const SURGE_CHANCE = 0.25;
const SURGE_TIME = 180;

const SFX_HIT_TILE = ['Item10'];

let _surgeType = -1;

export class GraniteArrowPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.AIType = Terraria.ID.ProjectileID.WoodenArrowFriendly;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = 1;
        this.Projectile.arrow = true;
        this.Projectile.friendly = true;
        this.Projectile.ranged = true;
        this.Projectile.penetrate = 1;
        this.Projectile.light = 0.25;
        this.Projectile.timeLeft = 600;
    }

    AI(proj) {
        const vel = proj.velocity;
        const dust = Main.dust[Effects.NewDust(
            Vector2.new(proj.position.X + 2, proj.position.Y + 2),
            proj.width, proj.height, DUST_GRANITE,
            vel.X * 0.2, vel.Y * 0.2, 100, Color.White, 1.25
        )];
        if (dust) dust.noGravity = true;
    }

    OnHitNPC(proj, npc) {
        if (Math.random() >= SURGE_CHANCE) return;
        if (_surgeType < 0) _surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;
        if (_surgeType >= 0) npc.AddBuff(_surgeType, SURGE_TIME, false);
    }

    OnTileCollide(proj, hitDirection) {
        SoundHelper.play(SFX_HIT_TILE, proj.position.X, proj.position.Y);
        const vel = proj.velocity;
        Effects.NewDust(proj.position, proj.width, proj.height, DUST_GRANITE,
            vel.X * 0.2, vel.Y * 0.2, 100, Color.White, 1);
        return true;
    }
}
