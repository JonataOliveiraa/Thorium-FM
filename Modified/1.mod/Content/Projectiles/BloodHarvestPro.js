import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';

const { Vector2 } = Modules;

export class BloodHarvestPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-18, 8);
        this.dustCount = 2;
        this.dustType = 60;
    }

    SafeSetDefaults() {
        this.Projectile.width = 120;
        this.Projectile.height = 120;
        this.Projectile.idStaticNPCHitCooldown = 8;
    }

    ModifyDust(dust, position, scytheIndex) {
        dust.scale = 1.5;
    }
}