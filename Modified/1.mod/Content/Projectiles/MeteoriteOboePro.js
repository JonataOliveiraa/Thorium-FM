import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Rand, Effects } = Modules;
const { Main } = Terraria;

const DUST = 127;         // vento claro
const STICK_LIFE = 900;   // 15s grudado antes de soltar
const PULSE_EVERY = 20;

let _pulseType = -1;

/**
 * Sopro invisivel que gruda no primeiro inimigo que acerta e fica pulsando
 * ondas de vento nele. So um sopro por inimigo: ao grudar, o mais antigo morre.
 *
 * ai[0] = 0 voando, 1 grudado | ai[1] = indice do alvo
 * localAI[0] = tempo grudado / ritmo do anel | localAI[1] = timer do pulso
 */
export class MeteoriteOboePro extends ModProjectile {
    constructor() {
        super();
        // Sem textura: o efeito inteiro e feito de poeira
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 90;
    }

    // Grudado ele nao machuca mais: quem bate sao os pulsos
    CanDamage(proj) {
        return new ProjAI(proj, false)[0] === 0;
    }

    OnHitNPC(proj, npc) {
        const ai = new ProjAI(proj, false);
        if (ai[0] !== 0) return;

        ai[0] = 1;
        ai[1] = npc.whoAmI;

        const center = proj.Center;
        proj.velocity = Vector2.new(
            (npc.Center.X - center.X) * 0.75,
            (npc.Center.Y - center.Y) * 0.75
        );
        proj.timeLeft = STICK_LIFE;
        proj.tileCollide = false;
        proj.ignoreWater = true;

        this._dropOldest(proj, npc.whoAmI);
    }

    // Mata o sopro anterior que ja estava neste inimigo
    _dropOldest(proj, targetIndex) {
        for (let i = 0; i < Main.maxProjectiles; i++) {
            const other = Main.projectile[i];
            if (i === proj.whoAmI || !other || !other.active) continue;
            if (other.owner !== proj.owner || other.type !== proj.type) continue;

            const otherAI = new ProjAI(other, false);
            if (otherAI[0] !== 1 || (otherAI[1] | 0) !== targetIndex) continue;

            other.Kill();
            return;
        }
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        if (ai[0] === 1) this._stuck(proj, ai);
        else this._flying(proj);
    }

    _flying(proj) {
        const center = proj.Center;
        const vel = proj.velocity;
        const local = new ProjAI(proj, true);

        // Borrifo curto atras, ligando a posicao deste tick com a do anterior
        for (let i = 0; i < 4; i++) {
            const dust = Main.dust[Effects.NewDust(
                Vector2.new(center.X - vel.X / 4 * i, center.Y - vel.Y / 4 * i),
                0, 0, DUST, 0, 0, 0, Color.White, 2
            )];
            if (!dust) continue;
            dust.noGravity = true;
            dust.noLight = true;
        }

        // A cada 5 ticks abre um anel alongado no sentido do voo
        local[0] = local[0] + 1;
        if (local[0] <= 5) return;

        local[0] = 0;
        FxHelper.ring(center.X, center.Y, 20, 2, 8, DUST, 1, 1.15, Math.atan2(vel.Y, vel.X), 0);
    }

    _stuck(proj, ai) {
        const index = ai[1] | 0;
        const npc = index >= 0 && index < Main.maxNPCs ? Main.npc[index] : null;

        if (!npc || !npc.active || npc.dontTakeDamage) {
            proj.Kill();
            return;
        }

        // Acompanha o inimigo, um passo atras do ponto de impacto
        const vel = proj.velocity;
        proj.Center = Vector2.new(npc.Center.X - vel.X * 2, npc.Center.Y - vel.Y * 2);
        proj.gfxOffY = npc.gfxOffY;

        // Poeira convergindo pro alvo, pra deixar claro que ele esta marcado
        const ox = Rand.Next(-50, 51);
        const oy = Rand.Next(-50, 51);
        const dust = Main.dust[Effects.NewDust(npc.position, npc.width, npc.height, DUST, 0, 0, 100, Color.White, 1.5)];
        if (dust) {
            dust.noGravity = true;
            dust.position = Vector2.new(dust.position.X + ox, dust.position.Y + oy);
            dust.velocity = Vector2.new(-ox * 0.08, -oy * 0.08);
        }

        if (Main.myPlayer !== proj.owner) return;

        const local = new ProjAI(proj, true);
        local[1] = local[1] + 1;
        if (local[1] < PULSE_EVERY) return;
        local[1] = 0;

        if (_pulseType === -1) _pulseType = ModProjectile.getTypeByName('MeteoriteOboePro2') ?? -2;
        if (_pulseType < 0) return;

        Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
            proj.GetProjectileSource_FromThis(),
            npc.Center, Vector2.Zero,
            _pulseType, Math.max(1, Math.round(proj.damage * 0.5)), proj.knockBack, proj.owner,
            0, 0, 0, null
        );
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
