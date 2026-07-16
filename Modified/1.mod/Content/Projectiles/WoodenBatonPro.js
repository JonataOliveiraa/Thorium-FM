import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';

const { Vector2 } = Modules;

export class WoodenBatonPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = -1;
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 76;
        this.Projectile.height = 76;
        this.Projectile.idStaticNPCHitCooldown = 20;
    }
}