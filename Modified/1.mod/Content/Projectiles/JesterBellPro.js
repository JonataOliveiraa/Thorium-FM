import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

export class JesterBellPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Items/Jester/JesterBell';
        this.maxTime = 120;
        this.fadeDuration = 15;
    }

    SetDefaults() {
        this.Projectile.width = 40;
        this.Projectile.height = 40;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = this.maxTime;
        this.Projectile.alpha = 0;
        this.Projectile.ignoreWater = true;
    }

    GetAlpha(proj, lightColor) {
        return Color.new(lightColor.R, lightColor.G, lightColor.B, 255 - proj.alpha);
    }

    OnSpawn(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) return;

        proj.Center = Vector2.new(player.Center.X, player.Center.Y - 40);

        const myType = proj.type;
        for (let i = 0; i < Main.maxProjectiles; i++) {
            const other = Main.projectile[i];
            if (other.active && other.type === myType && other.owner === proj.owner && other.whoAmI !== proj.whoAmI) {
                other.Kill();
            }
        }

        const buffType = ModBuff.getTypeByName("DistortedTimeEnemy");
        const radius = 300;
        const radiusSq = radius * radius;
        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (npc.active && !npc.friendly && npc.damage > 0) {
                const distSq = Vector2.DistanceSquared(proj.Center, npc.Center);
                if (distSq < radiusSq) {
                    npc.AddBuff(buffType, 180, false);
                }
            }
        }
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        if (!player || !player.active) {
            proj.Kill();
            return;
        }

        proj.Center = Vector2.new(player.Center.X, player.Center.Y - 40);

        const fd = this.fadeDuration;
        if (proj.timeLeft > this.maxTime - fd) {
            const elapsed = this.maxTime - proj.timeLeft;
            proj.alpha = 255 - Math.floor((elapsed / fd) * 255);
        } else if (proj.timeLeft < fd) {
            proj.alpha = 255 - Math.floor((proj.timeLeft / fd) * 255);
        } else {
            proj.alpha = 0;
        }

        const ai = new ProjAI(proj, true);
        if (ai[2] === 0) {
            ai[2] = 1;
            ai[0] = 0.0;
            ai[1] = 0.12;
        }

        const stiffness = 0.05;
        const damping = 0.95;
        ai[1] += -stiffness * ai[0];
        ai[1] *= damping;
        ai[0] += ai[1];
        proj.rotation = ai[0];
    }
}