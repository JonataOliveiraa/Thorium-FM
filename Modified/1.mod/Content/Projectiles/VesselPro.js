import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Effects } = Modules;
const { Main } = Terraria;
const WHITE = Color.White;

const DUST_TYPE = 5; // sangue

export class VesselPro extends ModProjectile {
    constructor() {
        super();
        // Sem textura: o jato inteiro e feito de poeira
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.magic = true;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 24; // jato curto: morre logo depois de sair
    }

    // Duas camadas de poeira: uma grossa e opaca, outra fina por cima
    AI(proj) {
        const pos = proj.position;
        const vel = proj.velocity;

        const thick = Main.dust[Effects.NewDust(pos, proj.width, proj.height, DUST_TYPE, vel.X, vel.Y, 150, WHITE, 2.5)];
        if (thick) thick.noGravity = true;

        const thin = Main.dust[Effects.NewDust(pos, proj.width, proj.height, DUST_TYPE, vel.X, vel.Y, 75, WHITE, 1.25)];
        if (thin) thin.noGravity = true;
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
