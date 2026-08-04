import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';

const { Vector2 } = Modules;

/**
 * Pulso de vento que o sopro grudado solta em quem esta marcado. Nasce pequeno
 * e no primeiro tick vira uma area de 120x120, batendo em tudo em volta.
 */
export class MeteoriteOboePro2 extends ModProjectile {
    constructor() {
        super();
        // Sem textura: o pulso inteiro e feito de poeira
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 20;
        this.Projectile.tileCollide = false;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }

    // ai[0] marca que o anel inicial ja saiu
    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (ai[0] <= 0) {
            ai[0] = 1;

            const center = proj.Center;
            FxHelper.ring(center.X, center.Y, 50, 4, 4, 127, 5.5, 1.75, 0, 0);

            // Cresce pros 120x120 mantendo o centro no lugar
            proj.position = Vector2.new(center.X - 60, center.Y - 60);
            proj.width = 120;
            proj.height = 120;
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
