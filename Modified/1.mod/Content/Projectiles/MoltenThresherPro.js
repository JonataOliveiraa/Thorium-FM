import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';
import { Color } from '../../TL/Modules/Color.js';

const { Rand, Vector2 } = Modules;

export class MoltenThresherPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;

        this.dustOffset = Vector2.new(-14, 10);
        this.dustCount = 2;
        this.dustType = 174;
    }

    SafeSetDefaults() {
        this.Projectile.width = 116;
        this.Projectile.height = 116;
        this.Projectile.idStaticNPCHitCooldown = 8;
    }

    ModifyDust(dust, position, scytheIndex) {
        if (Rand.NextBool()) {
            dust.noLight = false;
        }
        dust.scale = 1.15;
    }
    
    OnHitNPC(proj, npc) {
        super.OnHitNPC(proj, npc);
        if (Rand.NextBool()) {
            npc.AddBuff(24, 120, false);
        }
    }
}