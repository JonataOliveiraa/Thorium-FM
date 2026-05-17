import { Modules, Terraria } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from "./../../TL/ModBuff.js";
import { ProjAI } from '../../TL/ProjAI.js';


export class ThunderZap extends ModProjectile {
  constructor() {
    super();
    this.Texture = 'Projectiles/' + this.constructor.name;
  }

  SetDefaults() {
    this.Projectile.width = 18;
    this.Projectile.height = 34;
    this.Projectile.scale = 1;
    this.Projectile.aiStyle = -1;
    this.Projectile.friendly = true;
    this.Projectile.hostile = false;
    this.Projectile.ranged = true;
    this.Projectile.penetrate = 1;
    this.Projectile.timeLeft = 100;
    this.Projectile.penetrate = -1;
    this.Projectile.light = 0.5;
    this.Projectile.extraUpdates = 2; // Ultra rápido
    this.Projectile.alpha = 255;
    this.Projectile.ignoreWater = true;
    this.Projectile.tileCollide = true;
    this.Projectile.extraUpdates = 1;
    this.Projectile.usesLocalNPCImmunity = true;
    this.Projectile.localNPCHitCooldown = -1;
  }

   AI(proj) {

        try {
        const ai = new ProjAI(proj);
        if (ai[1] === 0) {
                let closestNPC = null;
                let minDist = 300.0;

                for (let i = 0; i < 200; i++) {
                    let npc = Terraria.Main.npc[i];
                    if (npc && npc.active && !npc.friendly && npc.lifeMax > 5 && npc.whoAmI) {
                        let dx = npc.Center.X - proj.Center.X;
                        let dy = npc.Center.Y - proj.Center.Y;
                        let dist = Math.hypot(dx, dy);

                        if (dist < minDist) {
                            minDist = dist;
                            closestNPC = npc;
                        }
                    }
                }

                if (closestNPC) {
                    // Achou um alvo! Calcula a direção e salva que já mirou (ai[1] = 1)
                    let dx = closestNPC.Center.X - proj.Center.X;
                    let dy = closestNPC.Center.Y - proj.Center.Y;
                    let dist = Math.hypot(dx, dy) || 1;
                    
                    proj.velocity.X = (dx / dist) * 16.0;
                    proj.velocity.Y = (dy / dist) * 16.0;
                    ai[1] = 1; 
                } else {
                    // Se não achou ninguém, morre na hora
                    proj.Kill();
                    return;
                }
            }

            // Gira apontando para onde está indo
            proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI / 2;

            // Rastro elétrico
            let dPos = Modules.Vector2.new(); dPos.X = 0; dPos.Y = 0;
            let dColor = Modules.Color.new(); dColor.R=255; dColor.G=255; dColor.B=255; dColor.A=255;
            let d = Terraria.Dust.NewDustPerfect(proj.Center, 226, dPos, 0, dColor, 0.8);
            if (d) d.noGravity = true;

        } catch (e) {}
    }
}