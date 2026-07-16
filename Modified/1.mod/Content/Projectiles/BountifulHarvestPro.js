import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';
import { Rand } from '../../TL/Modules/Rand.js';

const { Vector2 } = Modules;

export class BountifulHarvestPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-16, 4);
        this.dustCount = 2;
        this.dustType = 44;
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 100;
        this.Projectile.height = 100;
    }

    OnHitNPC(proj, npc) {
        if(Rand.NextBool(2)) npc.AddBuff(20, 180, false)
    }
}