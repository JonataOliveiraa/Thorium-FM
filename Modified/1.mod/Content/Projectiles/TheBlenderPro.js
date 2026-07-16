import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Vector2 } = Modules;

export class TheBlenderPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 5;
        this.dustCount = 2
        this.dustOffset = Vector2.new(-28, 6)
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 13;
    }
}