import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Effects } = Modules;
const { Main } = Terraria;

/**
 * Onda de choque que estoura em cima do pandeiro quando o especial e usado.
 * Ela cresce por 12 ticks, murcha depois disso, e vai sumindo desde o comeco.
 */
export class EbonwoodTambourinePro2 extends ModProjectile {
    constructor() {
        super();
        // As texturas usam W maiusculo, por isso o caminho vai escrito na mao
        this.Texture = 'Projectiles/EbonWoodTambourinePro2';
    }

    SetDefaults() {
        this.Projectile.width = 38;
        this.Projectile.height = 38;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 30;
        this.Projectile.tileCollide = false;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 5;
    }

    // localAI[0] marca que o estouro inicial ja saiu
    AI(proj) {
        const local = new ProjAI(proj, true);

        if (local[0] === 0) {
            local[0] = 1;

            const center = proj.Center;
            Effects.PlaySound(Terraria.ID.SoundID.Item35, center.X, center.Y, 1, 0.92, 1.09);
            FxHelper.burst(proj.position, proj.width, proj.height, 15, 90, 3, 1.15, 75);
            FxHelper.ring(center.X, center.Y, 12, 20, 20, 90, 3, 1, 0, 75);
        }

        proj.scale += proj.timeLeft > 18 ? 0.04 : -0.025;

        // Ja nasce sumindo: some por igual ao longo dos 30 ticks de vida
        proj.alpha = Math.min(255, Math.round(255 * (1 - proj.timeLeft / 30)));
    }

    // A onda bate um pouco alem do proprio corpo
    ModifyDamageHitbox(proj, hitbox) {
        hitbox.X -= 8;
        hitbox.Y -= 8;
        hitbox.Width += 16;
        hitbox.Height += 16;
    }

    // O empurrao sai do jogador, jogando o inimigo pra longe de voce
    ModifyHitNPC(proj, npc, hit, modifiers) {
        const player = Main.player[proj.owner];
        if (player) modifiers.HitDirectionOverride = npc.Center.X < player.Center.X ? -1 : 1;
    }
}
