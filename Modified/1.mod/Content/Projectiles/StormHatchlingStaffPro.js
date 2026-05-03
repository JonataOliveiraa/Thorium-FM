import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Effects, Vector2 } = Modules;

export class StormHatchlingStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.IdleTime = 30; // ticks
        this.MinionSpeed = 12;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 5;
        
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }
    
    SetDefaults() {
        this.Projectile.aiStyle = -1;//66;
        this.Projectile.width = 18;
        this.Projectile.height = 28;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
    }
    
    CanCutTiles(proj) {
        return false;
    }
    
    AI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('HatclingBuff');
        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[Terraria.Main.myPlayer];
        
        if (!this.CheckActive(proj, player)) return;
        if (ai[1] < 0) ai[1] = 0;
        
        const target = this.GetTarget(proj, player, ai[1] === 0, ai[2]);
        if (target) {
            ai[1] = this.IdleTime; ai[2] = target.whoAmI;
            this.Attack(proj, target);
        } else {
            ai[1]--; ai[2] = -1;
            this.IdleMovement(proj, player);
        }
        
        if (Modules.Vector2.Distance(proj.Center, player.Center) > 2000) {
            proj.Center = player.Center; ai[1] = this.IdleTime; ai[2] = -1;
        }
        
        proj.rotation = proj.velocity.X * 0.05;
        this.Visuals(proj);
    }
    
    Attack(proj, target) {
        const toTarget = Modules.Vector2.Subtract(target.Center, proj.Center);
        if (toTarget.Length() > 0) toTarget['void Normalize()']();
        const desired = Modules.Vector2.Multiply(toTarget, this.MinionSpeed * 1.2);
        proj.velocity = Modules.Vector2.Divide(Modules.Vector2.Add(Modules.Vector2.Multiply(proj.velocity, 15), desired), 16);
    }
    
    IdleMovement(proj, player) {
        const idlePos = Modules.Vector2.Add(player.Center, Modules.Vector2.new(player.direction * -40, -60));
        const toIdle = Modules.Vector2.Subtract(idlePos, proj.Center);
        if (toIdle.Length() > 10) {
            toIdle['void Normalize()']();
            const desired = Modules.Vector2.Multiply(toIdle, this.MinionSpeed);
            proj.velocity = Modules.Vector2.Divide(Modules.Vector2.Add(Modules.Vector2.Multiply(proj.velocity, 39), desired), 40);
        } else {
            proj.velocity = Modules.Vector2.Multiply(proj.velocity, 0.9);
        }
    }
    
    GetTarget(proj, player, findTarget, oldTarget) {
        const maxRange = 700;
        if (player.HasMinionAttackTargetNPC) {
            let t = Terraria.Main.npc[player.MinionAttackTargetNPC];
            if (t.CanBeChasedBy(proj, false) && Modules.Vector2.Distance(proj.Center, t.Center) < maxRange * 1.5) return t;
        }
        let t = Terraria.Main.npc[oldTarget];
        if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        if (findTarget) {
            t = proj.FindTargetWithinRange(maxRange, true);
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        return null;
    }
    
    CheckActive(proj, player) {
        if (player.dead || !player.active) { player.ClearBuff(this.MinionBuff); return false; }
        if (player.FindBuffIndex(this.MinionBuff) >= 0) proj.timeLeft = 2;
        return true;
    }
    
        
       Visuals(proj) {
        let frameSpeed = 5;
        proj.frameCounter++;
        if (proj.frameCounter >= frameSpeed) {
            proj.frameCounter = 0;
            proj.frame++;
            if (proj.frame >= Terraria.Main.projFrames[this.Type]) {
                proj.frame = 0;
            }
        }
        
        Effects.AddLight(proj.Center, 0.78, 0.32, 0.1);
    }
}