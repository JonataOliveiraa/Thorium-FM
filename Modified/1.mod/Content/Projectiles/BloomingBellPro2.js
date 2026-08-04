import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

let _charmedType = -1;

/**
 * Flor que nasce onde a semente caiu. Ela fica plantada batendo em quem
 * encostar, e some sozinha depois de 3 segundos.
 */
export class BloomingBellPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 3;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 8;
    }

    GetAlpha(proj, color) {
        return Color.Multiply(Color.White, 1 - proj.alpha / 255);
    }

    // O empurrao sai da flor, jogando o inimigo pra longe dela
    ModifyHitNPC(proj, npc, hit, modifiers) {
        modifiers.HitDirectionOverride = npc.Center.X < proj.Center.X ? -1 : 1;
    }

    OnHitNPC(proj, npc) {
        if (_charmedType === -1) _charmedType = ModBuff.getTypeByName('CharmedBuff') ?? -2;
        if (_charmedType >= 0) npc.AddBuff(_charmedType, 180, false);
    }

    AI(proj) {
        /**
         * A gravidade so vale enquanto ela ainda esta caindo. Antes o +1 era
         * aplicado sempre: depois de pousar, a vanilla zerava o Y e a AI
         * somava de novo, entao a flor recolidia com o chao TODO tick, e com
         * varias flores no chao ao mesmo tempo isso travava o jogo.
         */
        const vel = proj.velocity;
        if (vel.Y !== 0 && vel.Y < 16) {
            proj.velocity = Vector2.new(vel.X, Math.min(16, vel.Y + 1));
        }

        if (++proj.frameCounter > 6) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 3;
        }

        if (proj.timeLeft < 30) proj.alpha = Math.min(255, proj.alpha + 8);
    }

    OnTileCollide(proj, hitDirection) {
        return false;
    }
}
