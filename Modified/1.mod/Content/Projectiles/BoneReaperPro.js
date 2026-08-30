import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Modules } from '../../TL/ModImports.js';

const { Vector2 } = Modules;

export class BoneReaperPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 26; // Bone
        this.dustOffset = Vector2.new(-14, 4);
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
        this.Projectile.idStaticNPCHitCooldown = 12;
    }
}
