import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';

const { Vector2 } = Modules;

export class BoneReaperPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-16, 7);
        this.dustCount = 3;
        this.dustType = 29;
    }

    SafeSetDefaults() {
        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 8;
    }

    ModifyDust(dust, position, scytheIndex) {
        dust.scale = 1.2;
    }
}