import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModBuff } from './../../TL/ModBuff.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Effects, Vector2 } = Modules;

export class LivingWoodAcornPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        
        // Variáveis de Estado Interno
        this.InAir = true;
        this.AttackTimer = 0;
        this.FoundTargetTimer = 0;
        this.Attacking = false;
        
        // Sistema de Animação e Ataques Especiais
        this.doSpecialAbility = false;
        this.doSpecialAttack = false;
        this.playAbilityAnimation = false;
        this.playAttackAnimation = false;
        this.playAutoAnimation = false;
        this.ShowAttackFrames = false;
        
        // Sistema de Rally
        this.hasRally = false;
        this.reachedRally = false;
        this.BusyRallying = false;
        this.oldRally = Vector2.new(0, 0);
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 19;
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargettingFeature[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.aiStyle = -1;
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.tileCollide = true;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 0;
        this.Projectile.penetrate = -1;
    }

    // Método Maestro: Controla o fluxo da IA
    AI(proj) {
        const player = Terraria.Main.player[proj.owner];
        
        if (!this.CheckActive(proj, player)) return;

        const rallyTarget = this.UpdateRallyAndAirState(proj, player);
        const enemyTarget = this.GetTarget(proj, player);

        this.HandleSpecialAttacks(proj, player);

        if (this.InAir) {
            this.FlyingMovement(proj, player, rallyTarget);
        } else {
            this.GroundMovement(proj, player, rallyTarget, enemyTarget);
            this.HandleAutoAttack(proj, player, enemyTarget);
        }

        this.Visuals(proj, player);
    }

    // 1. Manutenção de Vida
    CheckActive(proj, player) {
        const buffType = ModBuff.getTypeByName('LivingWoodAcornBuff'); // Substitua pelo seu Buff real
        const hasBuff = player.FindBuffIndex(buffType) >= 0;
        
        if (player.dead || !player.active || !hasBuff) {
            proj.active = false;
            return false;
        }
        proj.timeLeft = 2;
        return true;
    }

    // 2. Define o alvo de movimento (Rally ou Jogador) e verifica se deve voar
    UpdateRallyAndAirState(proj, player) {
        let targetPos;

        // Lógica do Rally ou Centro do Jogador
        if (this.hasRally) {
            targetPos = this.oldRally;
            const distSq = Terraria.Utils.DistanceSQ(proj.Center, targetPos);
            
            if (this.oldRally.X !== targetPos.X || this.oldRally.Y !== targetPos.Y || !this.reachedRally) {
                this.reachedRally = distSq < (proj.height * proj.width);
            }
            if (this.oldRally.X !== targetPos.X || this.oldRally.Y !== targetPos.Y) {
                proj.velocity.Y--;
                this.oldRally = targetPos;
            }
            if (proj.owner === Terraria.Main.myPlayer && Terraria.Utils.DistanceSQ(player.Center, proj.Center) > 1000000.0) {
                proj.Center = player.Center;
                this.hasRally = false;
                proj.netUpdate = true;
            }
        } else {
            this.reachedRally = false;
            targetPos = player.Center;
            if (Terraria.Utils.DistanceSQ(player.Center, proj.Center) > 250000.0) {
                proj.Center = player.Center;
            }
        }

        // Checagem de terreno para forçar voo
        const tX = Math.floor(targetPos.X / 16);
        const tY = Math.floor(targetPos.Y / 16);
        const pX = Math.floor(proj.Center.X / 16);
        const pY = Math.floor(proj.Center.Y / 16);
        const isTargetBelow = proj.Top.Y > targetPos.Y;
        
        const targetTileSolid = Terraria.WorldGen.InWorld(tX, tY + 1, 0) ? Terraria.Main.tileSolidTop[Terraria.Framing.GetTileSafely(tX, tY + 1).type] : false;
        const projTileSolid = Terraria.WorldGen.InWorld(pX, pY + 1, 0) ? Terraria.Main.tileSolidTop[Terraria.Framing.GetTileSafely(pX, pY + 1).type] : false;

        // Ficar preso ou cair na lava = voar
        if (proj.lavaWet || (this.BusyRallying && (!Terraria.WorldGen.InWorld(tX, tY, 0) || !Terraria.WorldGen.SolidTile(tX, tY, false))) && (!Terraria.Collision.CanHit(proj.Center, 1, 1, targetPos, 1, 1) || isTargetBelow && targetTileSolid || !isTargetBelow && projTileSolid)) {
            this.InAir = true;
            this.AttackTimer = 0;
        }

        // Se o alvo de caminhada fugir demais, voar
        if (!this.Attacking) {
            let num10 = 500;
            if (!this.hasRally) num10 += 50 * proj.minionPos;
            if (this.FoundTargetTimer > 0) num10 += 500;
            if (player.rocketDelay2 > 0) this.InAir = true;

            const num11 = targetPos.X - proj.Center.X;
            const num12 = targetPos.Y - proj.Center.Y;

            if (Math.sqrt(num11 * num11 + num12 * num12) > num10 || (Math.abs(num12) > 300.0 && this.FoundTargetTimer <= 0)) {
                if (num12 > 0.0 && proj.velocity.Y < 0.0) proj.velocity.Y = 0.0;
                if (num12 < 0.0 && proj.velocity.Y > 0.0) proj.velocity.Y = 0.0;
                this.InAir = true;
            }
        }

        return targetPos;
    }

    // 3. Sistema de Busca de Alvos
    GetTarget(proj, player) {
        if (this.Attacking && !this.BusyRallying) return null;

        let bestNpc = null;
        let minDist = 100000.0;
        const lineOfSightOrigin = Vector2.new(proj.Center.X, proj.Center.Y - 8);

        // Whip Target
        const minionTargetId = player.MinionAttackTargetNPC;
        if (minionTargetId >= 0) {
            const npc = Terraria.Main.npc[minionTargetId];
            if (npc.active && npc.CanBeChasedBy(proj, false)) {
                const dist = Math.abs(proj.Center.X - npc.Center.X) + Math.abs(proj.Center.Y - npc.Center.Y);
                if (dist < minDist && Terraria.Collision.CanHit(lineOfSightOrigin, 1, 1, npc.position, npc.width, npc.height)) {
                    minDist = dist;
                    bestNpc = npc;
                }
            }
        }

        // Nearest NPC
        if (!bestNpc) {
            for (let i = 0; i < Terraria.Main.maxNPCs; ++i) {
                const npc = Terraria.Main.npc[i];
                if (npc.active && npc.CanBeChasedBy(proj, false)) {
                    const dist = Math.abs(proj.Center.X - npc.Center.X) + Math.abs(proj.Center.Y - npc.Center.Y);
                    if (dist < minDist && Terraria.Collision.CanHit(lineOfSightOrigin, 1, 1, npc.position, npc.width, npc.height)) {
                        minDist = dist;
                        bestNpc = npc;
                    }
                }
            }
        }

        return bestNpc ? { npc: bestNpc, dist: minDist } : null;
    }

    // 4. Habilidades Acionadas Manualmente
    HandleSpecialAttacks(proj, player) {
        if (this.doSpecialAbility) {
            if (proj.owner === Terraria.Main.myPlayer) {
                const origin = Vector2.new(proj.Center.X, proj.Center.Y - 4);
                const spreadVec = Vector2.new(3, 0);
                const dmg = Math.floor(proj.damage * 0.25);
                const projType = ModProjectile.getTypeByName('LivingWoodAcornShotPro3');
                
                Terraria.Projectile.NewProjectile(null, origin.X, origin.Y, -spreadVec.X, -spreadVec.Y, projType, dmg, proj.knockBack, proj.owner, 0, 0);
                Terraria.Projectile.NewProjectile(null, origin.X, origin.Y, spreadVec.X, spreadVec.Y, projType, dmg, proj.knockBack, proj.owner, 0, 0);
            }
            Terraria.Audio.SoundEngine.PlaySound(Terraria.ID.SoundID.Item39, player.Center);
            this.doSpecialAbility = false;
            this.playAbilityAnimation = true;
        }
        
        if (this.doSpecialAttack) {
            if (proj.owner === Terraria.Main.myPlayer) {
                const origin = Vector2.new(proj.Center.X, proj.Center.Y - 4);
                let toMouse = Vector2.Subtract(Terraria.Main.MouseWorld, origin);
                
                if (toMouse.Length() > 12.0) {
                    toMouse = Terraria.Utils.SafeNormalize(toMouse, Vector2.new(0, 0));
                    toMouse = Vector2.Multiply(toMouse, 12.0);
                }
                
                const radians = 4 * (Math.PI / 180);
                const dmg = Math.floor(proj.damage * 0.25);
                const projType = ModProjectile.getTypeByName('LivingWoodAcornShotPro4');
                
                for (let i = 0; i < 3; ++i) {
                    const lerpVal = -radians + (radians - -radians) * (i / 2); // 3 projéteis (divisor 3-1)
                    const velocity = Terraria.Utils.RotatedBy(toMouse, lerpVal, undefined);
                    Terraria.Projectile.NewProjectile(null, origin.X, origin.Y, velocity.X, velocity.Y, projType, dmg, proj.knockBack, proj.owner, 0, 0);
                }
            }
            Terraria.Audio.SoundEngine.PlaySound(Terraria.ID.SoundID.Item17, player.Center);
            this.doSpecialAttack = false;
            this.playAttackAnimation = true;
            this.ShowAttackFrames = true;
        }
    }

    // 5. Ataque Automático Terrestre
    HandleAutoAttack(proj, player, targetData) {
        this.FoundTargetTimer--;
        if (this.FoundTargetTimer < 0) this.FoundTargetTimer = 0;
        if (this.Attacking) this.AttackTimer--;

        if (!targetData) return;

        let num33 = this.hasRally ? 0.0 : 40 * proj.minionPos;
        if (targetData.dist < 1000.0 + num33) {
            this.FoundTargetTimer = 120;
            const diffX = targetData.npc.Center.X - proj.Center.X;
            
            if (diffX <= 300.0 && diffX >= -300.0 && !this.BusyRallying) {
                this.playAutoAnimation = true;
                this.AttackTimer = 120;
                
                const origin = Vector2.new(proj.Center.X, proj.Center.Y - 8);
                let aim = Vector2.Subtract(targetData.npc.Center, origin);
                
                if (aim.Length() > 0.0) {
                    aim = Terraria.Utils.SafeNormalize(aim, Vector2.new(0, 0));
                    aim = Vector2.Multiply(aim, 2.0);
                }

                if (proj.owner === Terraria.Main.myPlayer) {
                    Terraria.Projectile.NewProjectile(null, proj.Center.X, proj.Center.Y - 4, aim.X, aim.Y, ModProjectile.getTypeByName('LivingWoodAcornShotPro'), proj.damage, proj.knockBack, Terraria.Main.myPlayer, 0, 0);
                }
                
                proj.spriteDirection = aim.X < 0.0 ? 1 : -1;
                proj.netUpdate = true;
            }
        }
    }

    // 6. Movimentação Aérea (Voo suave)
    FlyingMovement(proj, player, targetPos) {
        const num14 = 100;
        proj.tileCollide = false;
        
        let diffX = targetPos.X - proj.Center.X;
        if (!this.hasRally) diffX -= 40 * player.direction;
        
        // Verifica se pode pousar
        let canLand = false;
        if (!this.BusyRallying) {
            for (let i = 0; i < Terraria.Main.maxNPCs; ++i) {
                const npc = Terraria.Main.npc[i];
                if (npc.active && npc.CanBeChasedBy(proj, false)) {
                    if (Math.abs(targetPos.X - npc.Center.X) + Math.abs(targetPos.Y - npc.Center.Y) < 800.0) {
                        if (Terraria.Collision.CanHit(proj.position, proj.width, proj.height, npc.position, npc.width, npc.height)) {
                            canLand = true;
                            break;
                        }
                    }
                }
            }
        }

        if (!canLand && !this.hasRally) diffX -= 40 * proj.minionPos * player.direction;
        if (canLand) this.InAir = false;

        const diffY = targetPos.Y - proj.Center.Y;
        const dist = Math.sqrt(diffX * diffX + diffY * diffY);
        let limitSpeed = Math.max(12.0, Math.abs(player.velocity.X) + Math.abs(player.velocity.Y));

        // Pouso perto do alvo
        if (dist < num14 && player.velocity.Y === 0.0 && (this.hasRally ? (proj.Center.Y <= targetPos.Y) : (proj.Bottom.Y <= player.Bottom.Y)) && !Terraria.Collision.SolidCollision(proj.position, proj.width, proj.height)) {
            this.InAir = false;
            if (proj.velocity.Y < -6.0) proj.velocity.Y = -6.0;
        }

        let desiredX, desiredY;
        if (dist < 60.0) {
            desiredX = proj.velocity.X;
            desiredY = proj.velocity.Y;
        } else {
            const ratio = limitSpeed / dist;
            desiredX = diffX * ratio;
            desiredY = diffY * ratio;
        }

        // Aplica inércia de voo
        const accel = 0.4;
        if (proj.velocity.X < desiredX) proj.velocity.X += (proj.velocity.X < 0.0 ? accel * 1.5 : accel);
        if (proj.velocity.X > desiredX) proj.velocity.X -= (proj.velocity.X > 0.0 ? accel * 1.5 : accel);
        if (proj.velocity.Y < desiredY) proj.velocity.Y += (proj.velocity.Y < 0.0 ? accel * 1.5 : accel);
        if (proj.velocity.Y > desiredY) proj.velocity.Y -= (proj.velocity.Y > 0.0 ? accel * 1.5 : accel);

        proj.rotation = Math.atan2(proj.velocity.Y, proj.velocity.X) + Math.PI;
    }

    // 7. Movimentação Terrestre (Gravidade e Pulos)
    GroundMovement(proj, player, targetPos, targetData) {
        proj.rotation = 0.0;
        proj.tileCollide = true;

        let walkLeft = false;
        let walkRight = false;
        
        let offset = this.hasRally ? 0 : 40 * (proj.minionPos + 1) * player.direction;
        if (targetPos.X < proj.Center.X - 10 + offset) walkLeft = true;
        else if (targetPos.X > proj.Center.X + 10 + offset) walkRight = true;

        // Sobrescrever caminhada se houver inimigo
        if (targetData) {
            let num33 = this.hasRally ? 0.0 : 40 * proj.minionPos;
            let aggroRange = (proj.position.Y > Terraria.Main.worldSurface * 16.0) ? 200.0 : 400.0;

            if (targetData.dist < aggroRange + num33) {
                const diffX = targetData.npc.Center.X - proj.Center.X;
                if (diffX < -5.0) { walkLeft = true; walkRight = false; }
                else if (diffX > 5.0) { walkRight = true; walkLeft = false; }
            } else if (targetData.dist < 1000.0 + num33) {
                const diffX = targetData.npc.Center.X - proj.Center.X;
                if (diffX > 300.0 || diffX < -300.0) {
                    if (diffX < -50.0) { walkLeft = true; walkRight = false; }
                    else if (diffX > 50.0) { walkRight = true; walkLeft = false; }
                }
            }
        }

        // Parar se estiver atacando
        if (this.Attacking && !this.BusyRallying) {
            walkLeft = false; walkRight = false;
        }

        let accel = 0.2;
        let maxSpeed = 6.0;
        const playerSpeed = Math.abs(player.velocity.X) + Math.abs(player.velocity.Y);
        if (maxSpeed < playerSpeed) { maxSpeed = playerSpeed; accel = 0.3; }

        // Aceleração X
        if (walkLeft) proj.velocity.X -= (proj.velocity.X > -3.5 ? accel : accel * 0.25);
        else if (walkRight) proj.velocity.X += (proj.velocity.X < 3.5 ? accel : accel * 0.25);
        else {
            proj.velocity.X *= 0.9;
            if (proj.velocity.X >= -accel && proj.velocity.X <= accel) proj.velocity.X = 0.0;
        }

        proj.velocity.X = Terraria.Utils.Clamp(proj.velocity.X, -maxSpeed, maxSpeed);
        if (proj.velocity.X !== 0.0) proj.spriteDirection = proj.velocity.X < 0 ? 1 : -1;

        // Pulos e Escadas
        let isFacingWall = false;
        if (walkLeft || walkRight) {
            let checkX = Math.floor(proj.Center.X / 16) + (walkLeft ? -1 : 1);
            if (Terraria.WorldGen.SolidTile(checkX + Math.floor(proj.velocity.X), Math.floor(proj.Center.Y / 16), false)) isFacingWall = true;
        }

        Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);

        if (proj.velocity.Y === 0.0 && isFacingWall) {
            try {
                let pX = Math.floor(proj.Center.X / 16) + (walkLeft ? -1 : 1);
                let pY = Math.floor(proj.Center.Y / 16);
                let checkX = pX + Math.floor(proj.velocity.X);
                
                if (!Terraria.WorldGen.SolidTile(checkX, pY - 1, false) && !Terraria.WorldGen.SolidTile(checkX, pY - 2, false)) proj.velocity.Y = -5.1;
                else if (!Terraria.WorldGen.SolidTile(checkX, pY - 2, false)) proj.velocity.Y = -7.1;
                else if (Terraria.WorldGen.SolidTile(checkX, pY - 5, false)) proj.velocity.Y = -11.1;
                else if (Terraria.WorldGen.SolidTile(checkX, pY - 4, false)) proj.velocity.Y = -10.1;
                else proj.velocity.Y = -9.1;
            } catch (e) {
                proj.velocity.Y = -9.1;
            }
        }

        proj.velocity.Y += 0.4; // Gravidade
        if (proj.velocity.Y > 10.0) proj.velocity.Y = 10.0;
    }

    // 8. Controle de Animação (Spritesheet)
    Visuals(proj) {
        if (this.InAir) {
            proj.frame = 1; // Voo estático, controlado no FlyingMovement
            return;
        }

        if (this.playAttackAnimation && this.ShowAttackFrames) {
            if (proj.frame < 11 || proj.frame > 14) proj.frame = 11;
            proj.frameCounter++;
            if (proj.frameCounter > 3) {
                proj.frame++;
                proj.frameCounter = 0;
                if (proj.frame > 14) { proj.frame = 0; this.playAttackAnimation = false; }
            }
        } 
        else if (this.playAbilityAnimation) {
            if (proj.frame < 15 || proj.frame > 18) proj.frame = 15;
            proj.frameCounter++;
            if (proj.frameCounter > 3) {
                proj.frame++;
                proj.frameCounter = 0;
                if (proj.frame > 18) { proj.frame = 0; this.playAbilityAnimation = false; }
            }
        } 
        else if (this.playAutoAnimation) {
            proj.frame = 10;
            proj.frameCounter++;
            if (proj.frameCounter >= 8) { proj.frame = 0; this.playAutoAnimation = false; }
        } 
        else if (proj.velocity.Y === 0.0) {
            this.ShowAttackFrames = false;
            if (Math.abs(proj.velocity.X) > 0.8) {
                proj.frameCounter += Math.floor(Math.abs(proj.velocity.X)) + 1;
                if (proj.frameCounter > 6) { proj.frame++; proj.frameCounter = 0; }
                if (proj.frame < 3 || proj.frame >= 9) proj.frame = 3;
            } else {
                proj.frame = 0; proj.frameCounter = 0;
            }
        } 
        else {
            proj.frame = 2; // Frame de pulo/queda
            proj.frameCounter = 0;
        }
    }
}