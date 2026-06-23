import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ProjAI } from '../../../TL/ProjAI.js';

const { Color } = Modules;
const { Main } = Terraria;
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const CountNPCS = Terraria.NPC['int CountNPCS(int Type)'];

export class QueenTorrent extends ModProjectile {
    static _bossType = -1;

    constructor() {
        super();
        this.Texture = 'Projectiles/Boss/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 12;
    }

    SetDefaults() {
        this.Projectile.width = 160;
        this.Projectile.height = 160;
        this.Projectile.aiStyle = -1;
        this.Projectile.alpha = 75;
        this.Projectile.hostile = true;
        this.Projectile.tileCollide = false;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 420;
    }

    GetAlpha(proj, lightColor) {
        const ai = new ProjAI(proj, false);
        const fade = 0.5 - Math.min(ai[0], 6) * 0.05;
        return Color.Multiply(Color.White, fade);
    }

    AI(proj) {
        if (QueenTorrent._bossType === -1) {
            QueenTorrent._bossType = ModNPC.getTypeByName('QueenJellyfish');
        }
        if (CountNPCS(QueenTorrent._bossType) === 0) {
            proj.Kill();
            return;
        }

        const player = Main.player[Main.myPlayer];
        if (player && player.active && !player.dead) {
            const dx = player.Center.X - proj.Center.X;
            const dy = player.Center.Y - proj.Center.Y;
            const distSq = dx * dx + dy * dy;

            if (distSq < 250000) {
                if (distSq > 2500) {
                    const dustSpeedX = dx > 0 ? -6 : 6;
                    const dustIdx = NewDust(player.position, player.width, player.height, 176, dustSpeedX, 0, 100, Color.new(0, 0, 0, 0), 1);
                    const dust = Main.dust[dustIdx];
                    if (dust) dust.noGravity = true;
                }

                let pull = 0.02;
                if (distSq < 40000) pull = 0.03;
                if (distSq < 2500) pull = 0.04;

                let vel = player.velocity;
                if (dx > 0) {
                    if (vel.X > -3) vel.X -= pull;
                } else {
                    if (vel.X < 3) vel.X += pull;
                }
                player.velocity = vel;
            }
        }

        proj.frameCounter++;
        if (proj.frameCounter > 2) {
            proj.frameCounter = 0;
            proj.frame++;
        }
        if (proj.frame >= 12) {
            proj.frame = 0;
        }
    }
}