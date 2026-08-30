import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';

const { Color, Effects, Vector2 } = Modules;

export class HomingPro extends ModProjectile {
    constructor() {
        super();
    }

    get HomingOnPlayer() {
        return false;
    }
    
    get LightColor() {
        return null;
    }
    
    get Speed() {
        return 2.5;
    }
    get Inertia() {
        return 20;
    }
    get Distance() {
        return 750;
    }
    get Slowdown() {
        return true;
    }
    
    Heal(proj, player) {
        
    }
    
    SafePreAI(proj) {
        
    }
    
    SafeAI(proj) {
        
    }
    
    PlayerCanBeHomedInOn(player) {
        return player.active && !player.dead;
    }
    
    CheckPlayer(proj, player, distance) {
        if (!this.PlayerCanBeHomedInOn(player)) return false;
        const dx = proj.Center.X - player.Center.X;
        const dy = proj.Center.Y - player.Center.Y;
        return Math.sqrt(dx * dx + dy * dy) < distance;
    }
    
    NPCCanBeHomedInOn(proj, npc) {
        return npc.CanBeChasedBy(proj, false);
    }
    
    CheckNPC(proj, npc, distance) {
        if (!this.NPCCanBeHomedInOn(proj, npc)) {
            return false;
        }
        const num = proj.Distance(npc);
        if (num > distance) return false;
        return true;
    }
    
    AI(proj) {
        this.SafePreAI(proj);
        const lightColor = this.LightColor;
        if (lightColor !== null) Effects.AddLight(proj.Center, lightColor.R, lightColor.G, lightColor.B);
        const player = Terraria.Main.player[proj.owner];
        const distance = this.Distance;
        let vector2_1 = Vector2.new(-1, -1);
        let flag = false;
        if (this.HomingOnPlayer) {
            if (Terraria.Main.netMode === 0) {
                flag = this.CheckPlayer(proj, player, distance);
            } else {
                // Guiar no multiplayer ainda não implementado
            }
            if (flag) {
                vector2_1 = player.Center;
                if (proj.getRect()['bool Intersects(Rectangle rect)'](player.getRect())) this.Heal(proj, player);
            }
        } else {
            // Guiar em npcs ainda não implementado
        }
        if (vector2_1.X !== -1 && vector2_1.Y !== -1) {
            let vector2_2 = proj.DirectionTo(vector2_1);
            Vector2.Normalize(vector2_2);
            vector2_2 = Vector2.Multiply(vector2_2, this.Speed);
            const inertia = this.Inertia;
            const vel = Vector2.Add(Vector2.Multiply(proj.velocity, inertia), vector2_2);
            vel.X /= 1 + inertia; vel.Y /= 1 + inertia;
            proj.velocity = vel;
        } else if (this.Slowdown) {
            proj.velocity = Vector2.Multiply(proj.velocity, 0.95);
        }
        this.SafeAI(proj);
    }
    
    OnTileCollide(proj, hitDirection) {
        proj.position = proj.oldPosition;
        proj.velocity = Vector2.Zero;
        return false;
    }
}