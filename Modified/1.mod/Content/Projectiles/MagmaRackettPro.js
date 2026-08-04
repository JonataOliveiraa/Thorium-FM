import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;

const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];

const DUST = 174;
const WAVE_SPEED = 0.209439516; // ~1 volta a cada 30 ticks
const WAVE_STRENGTH = 6;
const HOME_RANGE = 400;
const SEARCH_EVERY = 15; // ticks entre uma busca de alvo e outra

let _singedType = -1;

/**
 * Nota invisivel que sai serpenteando e vai puxando pro inimigo mais proximo.
 * O que aparece na tela e o rastro de brasa.
 *
 * ai[0] = fase da onda | localAI[0..1] = rumo base guardado no primeiro tick
 */
export class MagmaRackettPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 22;
        this.Projectile.height = 22;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.alpha = 255;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 120;
    }

    OnHitNPC(proj, npc) {
        if (_singedType === -1) _singedType = ModBuff.getTypeByName('SingedBuff') ?? -2;
        if (_singedType >= 0) npc.AddBuff(_singedType, 120, false);
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);

        // Primeiro tick: guarda o rumo original, que e o eixo da serpenteada
        if (ai[0] === 0) {
            const vel = proj.velocity;
            const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y) || 1;
            local[0] = vel.X / len;
            local[1] = vel.Y / len;
        }

        let dirX = local[0];
        let dirY = local[1];
        const speed = Math.sqrt(proj.velocity.X ** 2 + proj.velocity.Y ** 2) || 8;

        // Puxa o eixo pro inimigo mais proximo, sem virar perseguicao total
        const target = this._nearest(proj, ai);
        if (target) {
            const center = proj.Center;
            const dx = target.Center.X - center.X;
            const dy = target.Center.Y - center.Y;
            const len = Math.sqrt(dx * dx + dy * dy) || 1;

            dirX = (dirX * 12 + dx / len) / 13;
            dirY = (dirY * 12 + dy / len) / 13;

            const norm = Math.sqrt(dirX * dirX + dirY * dirY) || 1;
            dirX /= norm;
            dirY /= norm;

            local[0] = dirX;
            local[1] = dirY;
        }

        // Serpenteada: seno aplicado perpendicular ao rumo
        const wave = Math.sin(ai[0] * WAVE_SPEED) * WAVE_STRENGTH;
        proj.velocity = Vector2.new(
            dirX * speed - dirY * wave,
            dirY * speed + dirX * wave
        );

        ai[0] = ai[0] + 1;

        this._trail(proj);
    }

    /**
     * ai[1] = ticks ate refazer a busca | ai[2] = alvo guardado (indice + 1).
     *
     * Usa o FindTargetWithinRange do proprio Terraria em vez de varrer os 200
     * NPCs na mao, e so refaz a busca de tempos em tempos: com useTime 16 e
     * autoReuse ficavam varias notas no ar, cada uma varrendo a lista inteira
     * todo tick. O alvo fica no ai do projetil, e nao na classe, porque a
     * instancia do ModProjectile e compartilhada por todas as notas.
     */
    _nearest(proj, ai) {
        const cached = ai[2] | 0;

        if (ai[1] > 0) {
            ai[1] = ai[1] - 1;

            if (cached > 0) {
                const npc = Main.npc[cached - 1];
                if (npc && npc.active && npc.CanBeChasedBy(proj, false)) return npc;
            }
            return null;
        }

        ai[1] = SEARCH_EVERY;

        const found = FindTargetWithinRange(proj, HOME_RANGE, true);
        const valid = found && found.active ? found : null;

        ai[2] = valid ? valid.whoAmI + 1 : 0;
        return valid;
    }

    // Duas brasas por tick: uma no corpo, outra meio passo atras
    _trail(proj) {
        const center = proj.Center;
        const vel = proj.velocity;
        const len = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y) || 1;
        const push = Vector2.new(vel.X / len * 2, vel.Y / len * 2);

        for (let i = 0; i < 2; i++) {
            const pos = Vector2.new(center.X - vel.X * 0.5 * i, center.Y - vel.Y * 0.5 * i);
            const dust = Main.dust[Effects.NewDust(pos, 0, 0, DUST, push.X, push.Y, 0, Color.White, 1)];
            if (!dust) continue;

            dust.noGravity = true;
            dust.fadeIn = 1;
            dust.scale = 0.75;
        }
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, DUST, 3, 0.75, 0);
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
