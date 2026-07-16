// GeyserPro.js
import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { MiscHelper } from '../Global/Utils/MiscHelper.js';
import { Vector2 } from '../../TL/Modules/Vector2.js';

const { Main } = Terraria;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class GeyserPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = null;
    }

    SetDefaults() {
        this.Projectile.width = 8;
        this.Projectile.height = 8;
        this.Projectile.aiStyle = 0;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 96;
        this.Projectile.extraUpdates = 1;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);

        proj.direction = proj.velocity.X > 0 ? 1 : -1;

        const bl = proj.BottomLeft;
        if (MiscHelper.IsOnStandableGround(bl.X, bl.Y - 6, proj.width)) {
            let vel = proj.velocity;
            vel.Y = -8;
            proj.velocity = vel;
        } else if (MiscHelper.IsOnStandableGround(bl.X, bl.Y, proj.width)) {
            let vel = proj.velocity;
            vel.Y = 0;
            proj.velocity = vel;
        } else {
            let vel = proj.velocity;
            vel.Y = 15;
            proj.velocity = vel;
        }

        if (Main.myPlayer !== proj.owner) return;

        ai[1]++;
        if (ai[1] < 0) return;

        const geyser2Type = ModProjectile.getTypeByName('GeyserPro2');
        const spawnPos = Vector2.new(proj.Center.X, proj.Bottom.Y - 30);
        NewProjectile(
            proj.GetProjectileSource_FromThis(),
            spawnPos,
            Vector2.new(proj.velocity.X * 0.01, 8),
            geyser2Type,
            proj.damage,
            proj.knockBack,
            proj.owner,
            0, 0, 0, null
        );
        ai[1] = -8;
    }

    PreDraw() {
        return false
    }
}