import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Vector2 } = Modules;

export class DownwardSpiralPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 37;
        this.dustOffset = Vector2.new(-14, 4)
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 13;
    }
}