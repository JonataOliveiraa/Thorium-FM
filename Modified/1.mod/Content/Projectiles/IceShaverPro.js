import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Vector2 } = Modules;

export class IceShaverPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 161;
        this.dustCount = 1;
        this.dustOffset = Vector2.new(-12, 4)
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 76;
        this.Projectile.height = 76;
        this.Projectile.idStaticNPCHitCooldown = 15;
    }

    OnHitNPC(proj, npc) {
        if(Rand.NextBool(3)) npc.AddBuff(44, 60, false)
    }
}