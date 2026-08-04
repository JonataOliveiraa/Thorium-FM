import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color } = Modules;

const LIFE = 240;
const SOLID_AT = 234; // so passa a bater em bloco depois de sair da concha

export class HostilePearl extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 20;
        this.Projectile.height = 20;
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = LIFE;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, lightColor) {
        return Color.White;
    }

    AI(proj) {
        proj.rotation += 0.08;
        if (proj.timeLeft < SOLID_AT) proj.tileCollide = true;
    }

    OnKill(proj) {
        FxHelper.burst(proj.position, proj.width, proj.height, 5, 11, 2, 1, 0, false);
    }
}
