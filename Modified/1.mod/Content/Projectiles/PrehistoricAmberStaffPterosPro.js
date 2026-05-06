import { Modules, Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Effects, Vector2 } = Modules;

export class PrehistoricAmberStaffPterosPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.IdleTime = 30;
        this.MinionSpeed = 12;
        this.ViewDist = 450;
        this.ShootCooldown = 30;
        this.IdealDist = 200;
        this.OrbitDirection = 1;
    }
    
    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }
    
    SetDefaults() {
        this.Projectile.aiStyle = -1;
        this.Projectile.width = 18;
        this.Projectile.height = 28;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
    }
    
    CanCutTiles(proj) { return false; }
    
    AI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('PrehistoricAmberStaffBuff');
        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[Terraria.Main.myPlayer];
        
        if (!this.CheckActive(proj, player)) return;
        if (ai[1] < 0) ai[1] = 0;
        if (ai[0] > 0) ai[0]--;
        
        const target = this.GetTarget(proj, player, ai[1] === 0, ai[2]);
        if (target) {
            ai[1] = this.IdleTime;
            ai[2] = target.whoAmI;
            this.RangedAttack(proj, target, ai);
            proj.spriteDirection = target.Center.X > proj.Center.X ? -1 : 1;
        } else {
            ai[1]--;
            ai[2] = -1;
            this.IdleMovement(proj, player);
            proj.spriteDirection = -player.direction;
        }
        proj.direction = proj.spriteDirection;
        
        if (Vector2.Distance(proj.Center, player.Center) > 2000) {
            proj.Center = player.Center;
            ai[1] = this.IdleTime;
            ai[2] = -1;
        }
        
        proj.rotation = proj.velocity.X * 0.05;
        this.Visuals(proj);
    }
    
    RangedAttack(proj, target, ai) {
        // Posição desejada: 70 pixels acima do centro do inimigo
        const targetPos = Vector2.new(target.Center.X, target.Center.Y - 70);
        const toTarget = Vector2.Subtract(targetPos, proj.Center);
        const dist = toTarget.Length();
        const dir = dist > 0 ? Vector2.Divide(toTarget, dist) : Vector2.new(0, 0);
        
        const dx = toTarget.X;
        const dy = toTarget.Y;
        
        // 1. Correção agressiva de altura (prioridade máxima)
        const heightInertia = 8;  // inércia baixa = sobe/desce rápido
        let desiredY = proj.velocity.Y;
        if (Math.abs(dy) > 15) {
            // Se estamos muito acima ou abaixo, força uma velocidade vertical forte
            const verticalSpeed = this.MinionSpeed * 1.2;
            desiredY = Math.sign(dy) * verticalSpeed;
            desiredY = (desiredY * 2 + proj.velocity.Y) / 3;  // suavização leve
        } else {
            // Já na altura correta: freia a descida / subida
            desiredY = proj.velocity.Y * 0.7;
        }
        
        // 2. Movimento horizontal orbital suave (só atua plenamente quando a altura está boa)
        let orbitalWeight = Math.abs(dy) < 30 ? 1.0 : 0.2;  // reduz órbita enquanto ajusta altura
        const orbitAngle = Math.atan2(dir.Y, dir.X) + (Math.PI / 2) * this.OrbitDirection;
        const orbitStrength = 0.5 + Math.sin(proj.whoAmI * 1.7 + (ai[0] || 0) * 0.15) * 0.2;
        const orbitX = Math.cos(orbitAngle) * this.MinionSpeed * orbitStrength * orbitalWeight;
        
        // 3. Aproximação / afastamento suave (também reduzido enquanto sobe)
        let approachX = 0;
        if (Math.abs(dx) > this.IdealDist + 40) {
            approachX = Math.sign(dx) * this.MinionSpeed * 0.4 * orbitalWeight;
        } else if (Math.abs(dx) < this.IdealDist - 40) {
            approachX = -Math.sign(dx) * this.MinionSpeed * 0.3 * orbitalWeight;
        }
        
        const desiredX = orbitX + approachX;
        
        // 4. Aplica inércia horizontal
        const horizInertia = 15;
        const newVelX = (proj.velocity.X * (horizInertia - 1) + desiredX) / horizInertia;
        const newVelY = (proj.velocity.Y * (heightInertia - 1) + desiredY) / heightInertia;
        
        proj.velocity = Vector2.new(newVelX, newVelY);
        
        // 5. Dispara continuamente se a distância horizontal ao alvo não for absurda
        const aimDir = Vector2.Subtract(target.Center, proj.Center);
        const aimDist = aimDir.Length();
        if (ai[0] <= 0 && aimDist < 550) {
            ai[0] = this.ShootCooldown;
            if (proj.owner == Terraria.Main.myPlayer) {
                const shootType = ModProjectile.getTypeByName('PrehistoricAmberStaffPterosProShoot');
                const aim = aimDist > 0 ? Vector2.Divide(aimDir, aimDist) : Vector2.new(0, 0);
                const shootSpeed = 10;
                const damage = proj.damage * 2;
                const source = Terraria.Projectile.GetNoneSource();
                Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
                    source, proj.Center, Vector2.Multiply(aim, shootSpeed),
                    shootType, damage, 0, proj.owner, 0, 0, 0, null
                );
            }
            this.OrbitDirection = this.OrbitDirection === 1 ? -1 : 1;
        }
    }
    
    IdleMovement(proj, player) {
        const time = (proj.whoAmI * 131) % 360 + (Terraria.Main.GameUpdateCount * 0.7) % 360;
        const offsetX = player.direction * -40 + Math.sin(time * 0.05) * 35;
        const offsetY = -60 + Math.cos(time * 0.07) * 18;
        const idlePos = Vector2.Add(player.Center, Vector2.new(offsetX, offsetY));
        const toIdle = Vector2.Subtract(idlePos, proj.Center);
        if (toIdle.Length() > 10) {
            toIdle['void Normalize()']();
            const desired = Vector2.Multiply(toIdle, this.MinionSpeed * 0.8);
            proj.velocity = Vector2.Divide(Vector2.Add(Vector2.Multiply(proj.velocity, 39), desired), 40);
        } else {
            proj.velocity = Vector2.Multiply(proj.velocity, 0.9);
        }
    }
    
    GetTarget(proj, player, findTarget, oldTarget) {
        const maxRange = this.ViewDist;
        if (player.HasMinionAttackTargetNPC) {
            let t = Terraria.Main.npc[player.MinionAttackTargetNPC];
            if (t && t.active && t.CanBeChasedBy(proj, false) && Vector2.Distance(proj.Center, t.Center) < maxRange * 1.4) return t;
        }
        let t = Terraria.Main.npc[oldTarget];
        if (t && t.active && t.CanBeChasedBy(proj, false) && Vector2.Distance(proj.Center, t.Center) < maxRange * 1.4) return t;
        if (findTarget) {
            t = proj.FindTargetWithinRange(maxRange, true);
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        return null;
    }
    
    CheckActive(proj, player) {
        if (player.dead || !player.active) {
            player.ClearBuff(this.MinionBuff);
            return false;
        }
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