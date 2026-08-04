import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const CanHitLine = Terraria.Collision['bool CanHitLine(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const FRAMES = 3;
const FRAME_TIME = 6;
const RISE_TIME = 40;    // quanto tempo a lapide fica de pe
const RISE_SPEED = -0.35;
const DUST_TYPE = 27;
const FADE_AT = 10;      // ticks finais em que ela some
const BLIND_PENALTY = 0.5; // dano pela metade se voce nao ve o alvo

export class GraveBusterPro2 extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 46;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.tileCollide = false;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 180;
        this.Projectile.friendly = false;
    }

    // O empurrao sai de voce, nao da lapide. Acertar atraves de parede vale menos.
    ModifyHitNPC(proj, npc, hit, modifiers) {
        const player = Main.player[proj.owner];
        if (!player) return;

        modifiers.HitDirectionOverride = npc.Center.X < player.Center.X ? -1 : 1;

        if (!CanHitLine(player.position, player.width, player.height, npc.position, npc.width, npc.height)) {
            modifiers.SourceDamage *= BLIND_PENALTY;
        }
    }

    /**
     * ai[0] = 0 enquanto ela cai invisivel procurando chao; 1 depois que
     * brotou. So a partir dai ela aparece e causa dano.
     */
    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (ai[0] < 1) {
            const bl = proj.BottomLeft;
            if (!MiscHelper.IsOnStandableGround(bl.X, bl.Y, proj.width)) return;

            ai[0] = 1;
            proj.friendly = true;
            proj.alpha = 0;
            proj.timeLeft = RISE_TIME;
            proj.velocity = Vector2.new(proj.velocity.X, RISE_SPEED);

            for (let i = 0; i < 6; i++) {
                Effects.NewDust(
                    proj.position, proj.width, proj.height + 12,
                    DUST_TYPE, Rand.Next(-3, 3), Rand.Next(-4, -1), 255, WHITE, 1
                );
            }
            return;
        }

        proj.direction = proj.velocity.X < 0 ? -1 : 1;
        proj.spriteDirection = proj.direction;

        if (proj.timeLeft < FADE_AT) proj.alpha = Math.min(255, proj.alpha + 20);

        // A animacao roda uma vez e trava no ultimo quadro (a lapide fica de pe)
        if (++proj.frameCounter > FRAME_TIME) {
            proj.frameCounter = 0;
            if (proj.frame < FRAMES - 1) proj.frame++;
        }
    }
}
