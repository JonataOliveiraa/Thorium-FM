import { ScythePro } from '../../Common/Projectiles/ScythePro.js';
import { Terraria, Modules } from '../../TL/ModImports.js';

const { Vector2 } = Modules;

export class MoltenThresherPro extends ScythePro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.dustType = 6; // Torch
        this.dustOffset = Vector2.new(-16, 4);
    }

    SetDefaults() {
        super.SetDefaults();

        this.Projectile.width = 116;
        this.Projectile.height = 116;
        this.Projectile.idStaticNPCHitCooldown = 12;
    }

    OnHitNPC(proj, npc) {
        super.OnHitNPC(proj, npc);
        // 2s de On Fire!, como na versao original.
        npc.AddBuff(Terraria.ID.BuffID.OnFire, 120, false);
    }
}
