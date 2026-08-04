import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Modules } from '../../TL/ModImports.js';

const { Vector2 } = Modules;

export class BatScythePro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-24, 4);
        this.dustCount = 3;
        this.dustType = 5; // sangue
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 10;
    }
}
