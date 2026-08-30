import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Modules } from '../../TL/ModImports.js';

const { Vector2 } = Modules;

export class FallingTwilightPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 27; // Shadowflame
        this.dustOffset = Vector2.new(-18, 4);
        this.dustCount = 2;
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 120;
        this.Projectile.height = 120;
        this.Projectile.light = 0.35;
        this.Projectile.idStaticNPCHitCooldown = 10;
    }
}
