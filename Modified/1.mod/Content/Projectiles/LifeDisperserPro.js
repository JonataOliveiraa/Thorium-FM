import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;

const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FRAMES = 2;
const TRAIL_DELAY = 2;
const HEAL_CHANCE = 0.5;

const DUST_GREEN = 157;
const DUST_PURPLE = 27;

export class LifeDisperserPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = 1;
        this.Projectile.timeLeft = 600;
        this.Projectile.extraUpdates = 1;
    }

    GetAlpha(proj, lightColor) {
        return Color.new(255, 255, 255, 100);
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);

        if (localAI[0] === 0) {
            localAI[0] = 1;
            proj.frame = Math.random() < 0.5 ? 0 : 1;
        }

        proj.rotation = Vector2.ToRotation(proj.velocity);

        if (++ai[0] <= TRAIL_DELAY) return;

        const dustType = proj.frame === 1 ? DUST_PURPLE : DUST_GREEN;
        const alpha = proj.frame === 1 ? 255 : 0;
        const center = proj.Center;
        const vel = proj.velocity;

        for (let i = 0; i < 2; i++) {
            const dust = NewDustDirect(center, proj.width, proj.height, dustType, 0, 0, alpha, Color.White, 1.25);
            if (!dust) continue;
            dust.position = Vector2.new(center.X - vel.X / 2 * i, center.Y - vel.Y / 2 * i);
            dust.velocity = Vector2.Zero;
            dust.noGravity = true;
        }
    }

    OnHitNPC(proj, npc) {
        this._burst(proj, npc.position, npc.width, npc.height, 15, 10, 1.25);

        if (Math.random() >= HEAL_CHANCE) return;

        const player = Main.player[proj.owner];
        if (!player || !player.active || player.dead) return;
        if (player.statLife >= player.statLifeMax2) return;

        const heal = Math.floor(ThoriumPlayer.class.Healer.getHealValue());
        if (heal < 1) return;

        player.Heal(heal);
    }

    OnTileCollide(proj, hitDirection) {
        this._burst(proj, proj.position, proj.width, proj.height, 10, 2, 1.25);
        return true;
    }

    _burst(proj, position, width, height, count, spread, scale) {
        const dustType = proj.frame === 1 ? DUST_PURPLE : DUST_GREEN;
        const alpha = proj.frame === 1 ? 255 : 0;

        for (let i = 0; i < count; i++) {
            const dust = NewDustDirect(position, width, height, dustType,
                Rand.NextFloat(-spread, spread), Rand.NextFloat(-spread, spread), alpha, Color.White, scale);
            if (dust) dust.noGravity = true;
        }
    }
}
