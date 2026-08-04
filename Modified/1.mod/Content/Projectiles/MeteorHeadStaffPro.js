import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Color, Vector2, Effects } = Modules;
const { Main } = Terraria;
const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];

const SEARCH_EVERY = 15; // ticks entre uma varredura de alvos e outra

let _buffType = -1;

/**
 * Cabeca de meteoro: fica orbitando voce e mergulha em quem chegar perto.
 * Diferente dos outros lacaios, ela so causa dano enquanto esta perseguindo
 * um alvo (friendly acompanha esse estado).
 */
export class MeteorHeadStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 26;
        this.Projectile.height = 26;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 1800;
        this.Projectile.tileCollide = false;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
    }

    OnHitNPC(proj, npc) {
        FxHelper.burst(npc.Center, 10, 10, 10, 174, 3, 1.25, 100);
    }

    AI(proj) {
        if (_buffType === -1) _buffType = ModBuff.getTypeByName('MeteorHeadStaffBuff') ?? -2;

        const player = Main.player[proj.owner];
        if (!this.CheckActive(proj, player)) return;

        // Rastro de brasa
        if (Math.random() < 0.34) {
            const vel = proj.velocity;
            const dust = Main.dust[Effects.NewDust(
                proj.position, proj.width, proj.height,
                6, vel.X * 0.2, vel.Y * 0.2, 200, Color.White, 2
            )];
            if (dust) dust.noGravity = true;
        }

        const target = this.GetTarget(proj, player);

        if (target) this.Attack(proj, target);
        else this.Idle(proj, player);

        proj.rotation = proj.velocity.X * 0.05;
        if (Math.abs(proj.velocity.X) > 0.2) proj.spriteDirection = -proj.direction;

        // So machuca quando esta em cima de alguem
        proj.friendly = target !== null;
    }

    CheckActive(proj, player) {
        if (!player || !player.active || player.dead) {
            if (player && _buffType >= 0) player.ClearBuff(_buffType);
            return false;
        }
        if (_buffType >= 0 && player.FindBuffIndex(_buffType) >= 0) proj.timeLeft = 2;
        return true;
    }

    /**
     * Alvo marcado primeiro (com alcance maior). Senao, o inimigo mais proximo
     * de VOCE, nao do lacaio: e isso que faz ele voltar em vez de se perder
     * atras de algo do outro lado do mapa.
     */
    GetTarget(proj, player) {
        const center = proj.Center;
        const playerCenter = player.Center;

        const leash = Math.abs(center.X - playerCenter.X) + Math.abs(center.Y - playerCenter.Y);
        if (leash > 1500) return null;

        if (player.HasMinionAttackTargetNPC) {
            const marked = Main.npc[player.MinionAttackTargetNPC];
            if (marked && marked.active && marked.CanBeChasedBy(proj, false)) {
                const dist = Math.abs(center.X - marked.Center.X) + Math.abs(center.Y - marked.Center.Y);
                if (dist < 800 && CanHit(center, 1, 1, marked.Center, 1, 1)) return marked;
            }
        }

        // Continua no alvo antigo enquanto ele servir, e so refaz a busca de
        // tempos em tempos: varrer os 200 NPCs com CanHit (que e um tracado de
        // linha) todo tick era o ponto mais caro deste lacaio.
        const ai = new ProjAI(proj, false);
        const cached = ai[1] | 0;

        if (ai[0] > 0) {
            ai[0] = ai[0] - 1;

            if (cached > 0) {
                const npc = Main.npc[cached - 1];
                if (npc && npc.active && npc.CanBeChasedBy(proj, false)) {
                    const dist = Math.abs(playerCenter.X - npc.Center.X) + Math.abs(playerCenter.Y - npc.Center.Y);
                    if (dist < 800) return npc;
                }
            }
            return null;
        }

        ai[0] = SEARCH_EVERY;

        let best = null;
        let bestDist = 800;

        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (!npc || !npc.active || !npc.CanBeChasedBy(proj, false)) continue;

            const npcCenter = npc.Center;
            const dist = Math.abs(playerCenter.X - npcCenter.X) + Math.abs(playerCenter.Y - npcCenter.Y);
            if (dist >= bestDist) continue;
            if (!CanHit(playerCenter, 1, 1, npcCenter, 1, 1)) continue;

            bestDist = dist;
            best = npc;
        }

        ai[1] = best ? best.whoAmI + 1 : 0;
        return best;
    }

    Attack(proj, target) {
        const center = proj.Center;
        const targetCenter = target.Center;
        const dx = targetCenter.X - center.X;
        const dy = targetCenter.Y - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        // Acelera na reta final, pra fechar o mergulho
        const speed = dist < 100 ? 10 : 6;
        const scale = speed / dist;
        const vel = proj.velocity;

        proj.velocity = Vector2.new(
            (vel.X * 14 + dx * scale) / 15,
            (vel.Y * 14 + dy * scale) / 15
        );
    }

    Idle(proj, player) {
        const center = proj.Center;
        const playerCenter = player.Center;
        const dx = playerCenter.X - center.X;
        const dy = playerCenter.Y - center.Y - 60;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;

        if (dist > 2000) {
            proj.Center = playerCenter;
            return;
        }

        if (dist > 70) {
            const scale = 8 / dist;
            const vel = proj.velocity;
            proj.velocity = Vector2.new(
                (vel.X * 20 + dx * scale) / 21,
                (vel.Y * 20 + dy * scale) / 21
            );
            return;
        }

        // Perto do posto ela fica derivando devagar em volta
        let vel = proj.velocity;
        if (vel.X === 0 && vel.Y === 0) vel = Vector2.new(-0.15, -0.05);
        proj.velocity = Vector2.Multiply(vel, 1.01);
    }
}
