import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Effects } from '../../TL/Modules/Effects.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

let SHROOM_BOOSTER_TYPE = -1;
const FIRE_INTERVAL = 90;

export class ShroomBoosterBulb extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 2;
    }

    SetDefaults() {
        this.Projectile.width = 46;
        this.Projectile.height = 41;
        this.Projectile.penetrate = 1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 3600;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);

        if (SHROOM_BOOSTER_TYPE < 0) {
            SHROOM_BOOSTER_TYPE = ModProjectile.getTypeByName('ShroomBooster') ?? -1;
        }

        if (ai[0] === 0 && proj.owner === Main.myPlayer) {
            for (let i = 0; i < Main.maxProjectiles; i++) {
                const other = Main.projectile[i];
                if (i !== proj.whoAmI && other.active && other.owner === proj.owner &&
                    (other.type === this.Type || other.type === SHROOM_BOOSTER_TYPE)) {
                    other.Kill();
                }
            }
            ai[0] = 1;
        }

        ai[1]++;
        if (ai[1] >= 0) {
            if (proj.owner === Main.myPlayer && SHROOM_BOOSTER_TYPE >= 0) {
                const source = Terraria.Projectile.GetNoneSource();
                const x = proj.Center.X;
                const y = proj.Center.Y + 2;
                NewProjectile(source, x, y, -1.15, -4.5, SHROOM_BOOSTER_TYPE, 0, 0, Main.myPlayer, 0, 0, 0, null);
                NewProjectile(source, x, y, 0, -4.5, SHROOM_BOOSTER_TYPE, 0, 0, Main.myPlayer, 0, 0, 0, null);
                NewProjectile(source, x, y, 1.15, -4.5, SHROOM_BOOSTER_TYPE, 0, 0, Main.myPlayer, 0, 0, 0, null);
            }
            Effects.PlaySound(Terraria.ID.SoundID.NPCDeath9, proj.position.X, proj.position.Y);
            proj.frame = 1;
            ai[1] = -FIRE_INTERVAL;
        } else if (ai[1] > -FIRE_INTERVAL + 4) {
            proj.frame = 0;
        }
    }

    OnKill(proj, timeLeft) {
        Effects.PlaySound(Terraria.ID.SoundID.NPCDeath1, proj.position.X, proj.position.Y);
        for (let i = 0; i < 15; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                Vector2.new(proj.position.X, proj.position.Y + 2),
                proj.width + 5, proj.height + 5,
                5,
                0, 0,
                100, Color.White, 2.2
            );
            if (dust) dust.noGravity = true;
        }
    }
}