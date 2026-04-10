import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Main } = Terraria;
const { ProjectileID } = Terraria.ID;
const { Vector2 } = Modules;

const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class LivingWoodAcornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }
    
    // VARIÁVEIS QUE FALTARAM (Isso causava o bug do undefined!)
    IdleTime = 50; 
    minionStates = {}; 
    
    MedDist = 600;
    MaxDist = 2000;
    acceleration = 0.3; 
    maxSpeedX = 8;
    maxSpeedY = 12;
    playerOffset = 50; 
    wetMultiplier = 0.85;
    
    GetJumpHeight(proj) {
        if (!proj.wet) return -12;
        return -8;
    }
    
    SetStaticDefaults() {
        Main.projPet[this.Type] = true;
        Main.projFrames[this.Type] = 19; 
        
        ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
        ProjectileID.Sets.MinionSacrificable[this.Type] = true;
    }
    
    SetDefaults() {
        this.Projectile.aiStyle = 14; 
        this.Projectile.width = 34; 
        this.Projectile.height = 34; 
        this.Projectile.penetrate = -1;
        this.Projectile.minion = true;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = true;
        this.Projectile.ignoreWater = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.timeLeft = 18000;
        this.Projectile.decidesManualFallThrough = true;
        this.Projectile.usesIDStaticNPCImmunity = true;
        this.Projectile.idStaticNPCHitCooldown = 10;
        this.Projectile.netImportant = true;
    }
    
    CanCutTiles(proj) { return false; }
    
    PreAI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('LivingWoodAcornBuff');
        let player = Main.player[proj.owner];
        
        if (!this.CheckActive(proj, player)) return false;

        const ai = new ProjAI(proj);
        const localAI = new ProjAI(proj, true);

        // --- 1. Busca do Alvo (A cada 50 Ticks) ---
        if (localAI[0] > 0) {
            localAI[0]--;
        } else {
            const target = this.GetTarget(proj, player, localAI[1]);
            if (target) {
                localAI[1] = target.whoAmI;
            } else {
                localAI[1] = -1;
            }
            localAI[0] = this.IdleTime;
        }

        let targetNPC = null;
        if (localAI[1] !== -1) {
            targetNPC = Terraria.Main.npc[localAI[1]];
            if (!targetNPC || !targetNPC.active || !targetNPC.CanBeChasedBy(proj, false)) {
                targetNPC = null;
                localAI[1] = -1;
            }
        }

        // --- 2. Ataque a cada 1.5s (90 ticks) ---
        ai[0]++; 
        if (ai[0] >= 90) {
            if (targetNPC && Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'](proj.Center, 1, 1, targetNPC.position, targetNPC.width, targetNPC.height)) {
                ai[0] = 0; 
                
                if (!this.minionStates[proj.whoAmI]) this.minionStates[proj.whoAmI] = {};
                this.minionStates[proj.whoAmI].playAutoAnimation = true;
                
                let aimX = targetNPC.Center.X - proj.Center.X;
                let aimY = targetNPC.Center.Y - proj.Center.Y;
                let dist = Math.sqrt(aimX * aimX + aimY * aimY);
                
                if (dist > 0) {
                    aimX = (aimX / dist) * 7.0;
                    aimY = (aimY / dist) * 7.0;
                }

                if (proj.owner === Terraria.Main.myPlayer) {
                    Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'](
                        null, proj.Center.X, proj.Center.Y - 4, aimX, aimY, ModProjectile.getTypeByName('LivingWoodAcornShotPro'), proj.damage, proj.knockBack, Terraria.Main.myPlayer, targetNPC.whoAmI, 0, 0, null);
                }
            } else if (ai[0] > 100) {
                ai[0] = 90; 
            }
        }

        // --- 3. Movimento ---
        this.GroundMinionAI(proj, player);
        
        // Vira pro inimigo na hora do tiro
        if (ai[0] < 20 && targetNPC) {
            proj.spriteDirection = Math.sign(targetNPC.Center.X - proj.Center.X);
            proj.direction = proj.spriteDirection;
        }
        
        this.PlayAnimation(proj);
        proj.gfxOffY = -12;
        
        return false; 
    }

    GetTarget(proj, player, oldTarget) {
        const maxRange = 800;
        if (player.HasMinionAttackTargetNPC && oldTarget !== player.MinionAttackTargetNPC) {
            let t = Terraria.Main.npc[player.MinionAttackTargetNPC];
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        if (oldTarget >= 0) {
            let t = Terraria.Main.npc[oldTarget];
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        let nearestDist = maxRange;
        let nearestTarget = null;
        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            let npc = Terraria.Main.npc[i];
            if (npc && npc.active && npc.CanBeChasedBy(proj, false)) {
                let dx = npc.Center.X - proj.Center.X;
                let dy = npc.Center.Y - proj.Center.Y;
                let dist = Math.sqrt(dx*dx + dy*dy);
                if (dist < nearestDist) { nearestDist = dist; nearestTarget = npc; }
            }
        }
        return nearestTarget;
    }
    
    GroundMinionAI(proj, player) {
        const v = proj.velocity;
        
        Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);
        
        proj.shouldFallThrough = player.position.Y + player.height - 12 > proj.position.Y + proj.height;
        
        const targetX = player.Center.X - player.direction * (this.playerOffset + proj.minionPos * (proj.width + 1));
        const targetY = player.Center.Y;
        const dx = targetX - proj.Center.X;
        const dy = targetY - proj.Center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        const stuck = proj.tileCollide && SolidCollision(proj.position, proj.width, proj.height);
        
        let hitWall = false;
        let onGround = false;
        
        if (proj.tileCollide) {
            const moveTest = Vector2.new(Math.sign(dx) * 4, 0);
            const test = TileCollision(proj.position, moveTest, proj.width, proj.height, true, true, 1, false, false, true);
            hitWall = test.X !== moveTest.X;
            const groundTest = TileCollision(proj.position, Vector2.new(0, 1), proj.width, proj.height, true, true, 1, false, false, true);
            onGround = groundTest.Y === 0;
        }
        
        if (dist > this.MaxDist) {
            proj.Center = player.Center;
        } else if (dist > this.MedDist || stuck) {
            proj.tileCollide = false;
            v.X += dx * 0.05; 
            v.Y += dy * 0.05;
            v.X *= 0.94;
            v.Y *= 0.94;
        } else {
            proj.tileCollide = true;
            const absDx = Math.abs(dx);
            
            if (absDx > this.playerOffset + 15) {
                v.X += Math.sign(dx) * this.acceleration;
            } else if (absDx < this.playerOffset - 15) {
                v.X *= 0.8;
            } else {
                if (Math.abs(player.velocity.X) > 0.5) {
                    v.X = (v.X * 3 + player.velocity.X) / 4; 
                } else {
                    v.X *= 0.8; 
                }
            }
            
            let jumpHeight = this.GetJumpHeight(proj);
            if (hitWall && onGround) v.Y = jumpHeight;
            if (onGround && dx > (this.playerOffset * 2) && dy < -40) v.Y = jumpHeight;
            
            v.Y += 0.4; 
        }
        
        if (v.X > this.maxSpeedX) v.X = this.maxSpeedX;
        if (v.X < -this.maxSpeedX) v.X = -this.maxSpeedX;
        if (v.Y > this.maxSpeedY) v.Y = this.maxSpeedY;
        if (v.Y < -this.maxSpeedY) v.Y = -this.maxSpeedY;
        
        if (Terraria.Collision['bool WetCollision(Vector2 Position, int Width, int Height)'](proj.position, proj.width, proj.height)) {
            proj.wet = true;
            v.X *= this.wetMultiplier;
            v.Y *= this.wetMultiplier;
        }
        
        if (Math.abs(v.X) < 0.075) v.X = 0;
        
        proj.velocity = v;

        if (v.X !== 0) {
            proj.spriteDirection = Math.sign(v.X);
        } else {
            proj.spriteDirection = player.direction;
        }
        proj.direction = proj.spriteDirection;
    }
    
    PlayAnimation(proj) {
        let frameSpeed = 5;

        // Toca a animação de ataque se for a hora
        if (this.minionStates[proj.whoAmI] && this.minionStates[proj.whoAmI].playAutoAnimation) {
            proj.frame = 10;
            proj.frameCounter++;
            if (proj.frameCounter >= 8) { 
                proj.frame = 0; 
                this.minionStates[proj.whoAmI].playAutoAnimation = false; 
            }
            return;
        }

        if (!proj.tileCollide || Math.abs(proj.velocity.Y) > 0.8) {
            proj.frameCounter++;
            if (proj.frameCounter > frameSpeed) {
                proj.frame = proj.frame === 1 ? 2 : 1; 
                proj.frameCounter = 0;
            }
        } 
        else if (Math.abs(proj.velocity.X) > 0.5) { 
            proj.frameCounter += Math.floor(Math.abs(proj.velocity.X)) + 1;
            if (proj.frameCounter > 6) { 
                proj.frame++; 
                proj.frameCounter = 0; 
            }
            if (proj.frame < 3 || proj.frame > 8) proj.frame = 3; 
        } 
        else { 
            proj.frame = 0; 
            proj.frameCounter = 0;
        }
    }

    CheckActive(proj, player) {
        if (player.dead || !player.active) {
            player.ClearBuff(this.MinionBuff);
            return false;
        }
        if (player.FindBuffIndex(this.MinionBuff) >= 0) {
            proj.timeLeft = 2;
        } else {
            return false;
        }
        return true;
    }
}