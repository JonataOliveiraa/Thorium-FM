import { Terraria, Modules } from '../../../TL/ModImports.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';

const { Vector2, Color } = Modules;

export class EarthenRock extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/NPC/' + this.constructor.name;
    }

    SetDefaults() {
        this.Projectile.width = 16;
        this.Projectile.height = 16;
        this.Projectile.scale = 0.8
        this.Projectile.aiStyle = -1;
        this.Projectile.hostile = true;
        this.Projectile.friendly = false;
        this.Projectile.tileCollide = false; 
        this.Projectile.ignoreWater = false;
        this.Projectile.timeLeft = 400; 
    }

    AI(proj) {
        const directionGiro = proj.velocity.X > 0 ? 1 : -1;

        proj.velocity.Y += 5.0;
        if (proj.velocity.Y > 23.0) { // Limite máximo da velocidade da queda
            proj.velocity.Y = 23.0;
        }

        // 3. Procura o Jogador Alvo
        let targetPlayer = null;
        let closestDistance = -1;

        for (let i = 0; i < 255; i++) {
            const player = Terraria.Main.player[i];
            if (player && player.active && !player.dead) {
                const dist = Vector2.Distance(proj.Center, player.Center);
                if (closestDistance === -1 || dist < closestDistance) {
                    closestDistance = dist;
                    targetPlayer = player;
                }
            }
        }

        if (targetPlayer) {
            if (proj.position.Y >= targetPlayer.position.Y - 16) {
                proj.tileCollide = true; // Liga a colisão com blocos para bater no chão
            }
        } else {
            proj.tileCollide = true; 
        }
    }
}