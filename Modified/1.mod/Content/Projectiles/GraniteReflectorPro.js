import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const DUST_GRANITE = 59;
const DUST_SPARK = 56;

const SURGE_RANGE_SQ = 25600;
const SURGE_TIME = 300;

let _surgeType = -1;

export class GraniteReflectorPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.AIType = 52;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = 3;
        this.Projectile.friendly = true;
        this.Projectile.melee = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 600;
    }

    AI(proj) {
        if (Math.random() >= 1 / 3) return;

        const vel = proj.velocity;
        const dust = Main.dust[Effects.NewDust(
            proj.position, proj.width, proj.height, DUST_GRANITE,
            vel.X * 0.2, vel.Y * 0.2, 0, Color.White, 1.35
        )];
        if (dust) dust.noGravity = true;
    }

    OnHitNPC(proj, npc) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] !== 0) return;
        localAI[0] = 1;

        if (_surgeType < 0) _surgeType = ModBuff.getTypeByName('GraniteSurgeBuff') ?? -1;

        for (let i = 0; i < 15; i++) {
            const dust = NewDustDirect(proj.position, proj.width, proj.height, DUST_SPARK,
                Rand.Next(-8, 9), Rand.Next(-8, 9), 150, Color.White, 1.35);
            if (dust) dust.noGravity = true;
        }

        if (_surgeType < 0) return;

        const center = proj.Center;
        const npcs = Main.npc;
        for (let i = 0; i < Main.maxNPCs; i++) {
            const other = npcs[i];
            if (!other.active || !other.CanBeChasedBy(proj, false)) continue;

            const dx = other.Center.X - center.X;
            const dy = other.Center.Y - center.Y;
            if (dx * dx + dy * dy >= SURGE_RANGE_SQ) continue;

            other.AddBuff(_surgeType, SURGE_TIME, false);
        }
    }
}
