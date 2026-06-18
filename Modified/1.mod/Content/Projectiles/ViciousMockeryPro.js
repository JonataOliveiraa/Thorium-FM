import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Vector2, Rectangle } = Modules;
const CombatText = Terraria.CombatText;

export class ViciousMockeryPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 14;
        this.Projectile.height = 14;
        this.Projectile.aiStyle = -1;
        this.Projectile.timeLeft = 90;
        this.Projectile.penetrate = 2;
        this.Projectile.friendly = true;
        this.Projectile.alpha = 0;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        localAI[0]++;

        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

        if (proj.timeLeft <= 20) {
            proj.alpha = 255 - Math.floor((proj.timeLeft / 20) * 255);
        }

        for (let i = 0; i < 3; i++) {
            const dustIdx = Terraria.Dust.NewDust(
                proj.position, proj.width, proj.height,
                90, 0, 0, 0, Color.White, 1.2
            );
            const dust = Terraria.Main.dust[dustIdx];
            if (dust) {
                const pos = dust.position;
                pos.X = proj.Center.X + (Math.random() - 0.5) * 8;
                pos.Y = proj.Center.Y + (Math.random() - 0.5) * 8;
                dust.position = pos;
                const vel = dust.velocity;
                vel.X = (Math.random() - 0.5) * 0.8;
                vel.Y = (Math.random() - 0.5) * 0.8;
                dust.velocity = vel;
                dust.noGravity = true;
                dust.fadeIn = 1.2;
            }
        }

        Effects.AddLight(proj.Center, 0.3, 0.1, 0.1);
    }

    OnHitNPC(proj, npc, hit, damageDone) {
        this.ShowRandomSwear(npc);
    }

    ShowRandomSwear(npc) {
        const swear = ViciousMockeryPro.GetRandomSwear2("$#%@&") + "!?";
        const color = Color.new(255, 75, 75, 255);
        CombatText['int NewText(Rectangle location, Color color, string text, bool dramatic, bool dot)']
        (npc.Hitbox, color, swear, false, true);
    }

    static GetRandomSwear2(characters) {
        const maxLen = characters.length + 2;
        const len = 1 + Math.floor(Math.random() * maxLen);
        let result = "";
        let lastChar = '';
        for (let i = 0; i < len; i++) {
            let c;
            do {
                c = characters[Math.floor(Math.random() * characters.length)];
            } while (c === lastChar);
            lastChar = c;
            result += c;
        }
        return result;
    }

    OnKill(proj) {
        const num = 15 + Math.floor(Math.random() * 10);
        for (let i = 0; i < num; i++) {
            const dust = Terraria.Dust.NewDustDirect(
                proj.Center,
                0, 0,
                90,
                proj.velocity.X * 0.25 + (Math.random() - 0.5) * 2,
                proj.velocity.Y * 0.25 + (Math.random() - 0.5) * 2,
                100,
                Color.White,
                2.0
            );
            if (dust) {
                dust.fadeIn = 1.3 + Math.random() * 0.2;
                dust.noGravity = true;
                let pos = dust.position;
                pos.X += dust.velocity.X * 4;
                pos.Y += dust.velocity.Y * 4;
                dust.position = pos;
            }
        }
    }
}