import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Vector2 } = Modules;
const { BuffID } = Terraria.ID;

export class accScale extends ModProjectile {
    static SIZE = 210;
    static SPIN = 0.15;
    static BUFF_TIME = 120;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = accScale.SIZE;
        this.Projectile.height = accScale.SIZE;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.hostile = false;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.penetrate = -1;
        this.Projectile.damage = 1;
        this.Projectile.knockBack = 0;
        this.Projectile.timeLeft = 4;
        this.Projectile.alpha = 255;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 30;
        this.Projectile.netImportant = true;
    }

    AI(proj) {
        const player = Terraria.Main.player[proj.owner];

        if (!player || !player.active || player.dead
            || !(ThoriumPlayer.MoltenScaleEquipped || ThoriumPlayer.ObsidianScaleEquipped)) {
            proj.Kill();
            return;
        }

        proj.Center = player.Center;
        proj.velocity = Vector2.Zero;
        proj.rotation += accScale.SPIN;
        proj.timeLeft = 4;
    }

    OnHitNPC(proj, npc) {
        if (npc.wet) return;

        if (ThoriumPlayer.ObsidianScaleEquipped) {
            npc.AddBuff(BuffID.OnFire3, accScale.BUFF_TIME, false);
        } else if (ThoriumPlayer.MoltenScaleEquipped) {
            npc.AddBuff(BuffID.OnFire, accScale.BUFF_TIME, false);
        }
    }

    PreDraw(proj, lightColor) {
        return false;
    }
}
