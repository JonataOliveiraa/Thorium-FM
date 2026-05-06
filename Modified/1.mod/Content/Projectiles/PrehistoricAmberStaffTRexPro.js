import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Main } = Terraria;
const { ProjectileID } = Terraria.ID;
const { Vector2 } = Modules;

const SolidCollision = Terraria.Collision['bool SolidCollision(Vector2 Position, int Width, int Height)'];
const TileCollision = Terraria.Collision['Vector2 TileCollision(Vector2 oldPosition, Vector2 oldVelocity, int Width, int Height, bool fallThrough, bool fall2, int gravDir, bool ignoreDoors, bool ignoreAetheriumPlatforms, bool hoik)'];

export class PrehistoricAmberStaffTRexPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.IdleTime = 50;
        this.MedDist = 600;
        this.MaxDist = 2000;
        this.acceleration = 0.3;
        this.maxSpeedX = 8;
        this.maxSpeedY = 12;
        this.playerOffset = 50;
        this.wetMultiplier = 0.85;
        this.isAttacking = false;
        this.attackFrameCounter = 0;
        this.minionStates = {};
        this.isFlying = false;
    }

    GetJumpHeight(proj) {
        return proj.wet ? -6 : -8;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 15;

        ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
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
        this.Projectile.correctSlopeCollision = true;
    }

    CanCutTiles(proj) { return false; }

    PreAI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('PrehistoricAmberStaffBuff');
        const player = Main.player[proj.owner];

        if (!this.CheckActive(proj, player)) return false;

        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj);

        if (localAI[2] > 0) localAI[2]--;

        if (localAI[0] > 0) {
            localAI[0]--;
        } else {
            const target = this.GetTarget(proj, player, localAI[1]);
            localAI[1] = target ? target.whoAmI : -1;
            localAI[0] = this.IdleTime;
        }

        let targetNPC = null;
        if (localAI[1] !== -1 && proj.tileCollide) {
            targetNPC = Main.npc[localAI[1]];
            if (!targetNPC || !targetNPC.active || !targetNPC.CanBeChasedBy(proj, false)) {
                targetNPC = null;
                localAI[1] = -1;
            }
        }
        this.currentTarget = targetNPC;

        const onGround = this.GroundMinionAI(proj, player, targetNPC, localAI);
        this.isFlying = !proj.tileCollide;
        this.PlayAnimation(proj, onGround);

        proj.gfxOffY = -5;
        return false;
    }

    GetTarget(proj, player, oldTarget) {
        const maxRange = 800;
        if (player.HasMinionAttackTargetNPC) {
            const t = Main.npc[player.MinionAttackTargetNPC];
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        if (oldTarget >= 0) {
            const t = Main.npc[oldTarget];
            if (t && t.active && t.CanBeChasedBy(proj, false)) return t;
        }
        let nearestDist = maxRange;
        let nearestTarget = null;
        for (let i = 0; i < Main.maxNPCs; i++) {
            const npc = Main.npc[i];
            if (npc && npc.active && npc.CanBeChasedBy(proj, false)) {
                const dx = npc.Center.X - proj.Center.X;
                const dy = npc.Center.Y - proj.Center.Y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < nearestDist) { nearestDist = dist; nearestTarget = npc; }
            }
        }
        return nearestTarget;
    }

    GroundMinionAI(proj, player, targetNPC, localAI) {
        const v = proj.velocity;

        Terraria.Collision.StepUp(proj.position, proj.velocity, proj.width, proj.height, proj.stepSpeed, proj.gfxOffY, 1, false, 0);
        proj.shouldFallThrough = player.position.Y + player.height - 12 > proj.position.Y + proj.height;

        // No modo aéreo, siga apenas o jogador
        const effectiveTarget = proj.tileCollide ? targetNPC : null;
        let destX, destY;
        if (effectiveTarget) {
            destX = effectiveTarget.Center.X;
            destY = effectiveTarget.Center.Y;
        } else {
            destX = player.Center.X - player.direction * (this.playerOffset + proj.minionPos * (proj.width + 1));
            destY = player.Center.Y;
        }

        const dx = destX - proj.Center.X;
        const dy = destY - proj.Center.Y;
        const distToPlayer = Math.sqrt(
            Math.pow(player.Center.X - proj.Center.X, 2) +
            Math.pow(player.Center.Y - proj.Center.Y, 2)
        );

        const distToDest = Math.sqrt(dx * dx + dy * dy);

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

        if (distToPlayer > this.MaxDist) {
            proj.Center = player.Center;
            this.currentTarget = null;
            return onGround;
        }

        if (distToDest > this.MedDist || stuck) {
            proj.tileCollide = false;
            v.X += dx * 0.05;
            v.Y += dy * 0.05;
            v.X *= 0.94;
            v.Y *= 0.94;
        } else {
            proj.tileCollide = true;
            const absDx = Math.abs(dx);
            const stopDist = effectiveTarget ? 10 : this.playerOffset;

            if (absDx > stopDist + 15) {
                const boost = effectiveTarget ? this.acceleration * 1.5 : this.acceleration;
                v.X += Math.sign(dx) * boost;
            } else if (absDx < stopDist - 15) {
                v.X *= 0.8;
            } else {
                if (Math.abs(player.velocity.X) > 0.5 && !effectiveTarget) {
                    v.X = (v.X * 3 + player.velocity.X) / 4;
                } else {
                    v.X *= 0.8;
                }
            }

            let shouldJump = false;
            if (onGround && localAI[2] <= 0) {
                if (hitWall && Math.abs(dx) > 20 && Math.sign(dx) === Math.sign(proj.direction)) {
                    shouldJump = true;
                }
                if (effectiveTarget) {
                    const targetDy = effectiveTarget.Center.Y - proj.Center.Y;
                    const targetDx = effectiveTarget.Center.X - proj.Center.X;
                    if (targetDy < -20 || (Math.abs(targetDx) < 30 && targetDy < -10)) {
                        shouldJump = true;
                    }
                }
                if (!effectiveTarget && Math.abs(dx) > this.playerOffset * 2 && dy < -60) {
                    shouldJump = true;
                }

                if (shouldJump) {
                    v.Y = this.GetJumpHeight(proj);
                    localAI[2] = 25;
                }
            }

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

        if (effectiveTarget) {
            proj.spriteDirection = Math.sign(effectiveTarget.Center.X - proj.Center.X) || 1;
        } else if (v.X !== 0) {
            proj.spriteDirection = Math.sign(v.X);
        } else {
            proj.spriteDirection = player.direction;
        }
        proj.direction = proj.spriteDirection;

        return onGround;
    }

    PlayAnimation(proj, onGround) {
        if (this.isAttacking && (!this.currentTarget || !this.currentTarget.active)) {
            this.isAttacking = false;
            proj.frame = 14;
        }

        if (this.isAttacking) {
            this.attackFrameCounter++;
            if (this.attackFrameCounter >= 2) {
                this.attackFrameCounter = 0;
                proj.frame++;
            }
            if (proj.frame < 4 || proj.frame > 9) proj.frame = 4;
            if (proj.frame > 9) {
                proj.frame = 14;
                this.isAttacking = false;
            }
            return;
        }

        if (this.isFlying) {
            proj.frameCounter++;
            if (proj.frameCounter >= 5) {
                proj.frameCounter = 0;
                proj.frame++;
            }
            if (proj.frame < 10 || proj.frame > 13) proj.frame = 10;
            return;
        }

        if (Math.abs(proj.velocity.X) > 0.5) {
            proj.frameCounter += Math.floor(Math.abs(proj.velocity.X)) + 1;
            if (proj.frameCounter > 6) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame < 0 || proj.frame > 2) proj.frame = 0;
            return;
        }

        proj.frame = 3;
        proj.frameCounter = 0;
    }

    OnHitNPC(proj, npc) {
        if (!this.isAttacking) {
            this.isAttacking = true;
            this.attackFrameCounter = 0;
            proj.frame = 4;
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