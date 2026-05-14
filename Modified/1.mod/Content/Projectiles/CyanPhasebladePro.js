import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Vector2, Effects } = Modules;

export class CyanPhasebladePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.CopiesOwnerAttackCDToLocalImmunityOnSpawn[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 38;
        this.Projectile.height = 38;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.melee = true;
        this.Projectile.netImportant = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
        this.Projectile.aiStyle = -1;
    }

    AI(proj) {
        const ai = new ProjAI(proj);
        const localAI = new ProjAI(proj, true);
        const player = Terraria.Main.player[proj.owner];
        const cyan = Color.Cyan;

        Effects.AddLight(proj.Center, cyan.R / 255 * 0.5, cyan.G / 255 * 0.5, cyan.B / 255 * 0.5);

        // Recall check
        if (player.HeldItem.shoot === proj.type &&
            proj.owner === Terraria.Main.myPlayer &&
            ai[0] !== 1 &&
            player.active && !player.dead && player.controlUseItem) {
            ai[0] = 1;
            proj.netUpdate = true;
        }

        // timeLeft safety
        if (proj.timeLeft < 5 && player.active && !player.dead) {
            proj.timeLeft = 5;
            if (proj.owner === Terraria.Main.myPlayer && ai[0] !== 1) {
                ai[0] = 1;
                proj.netUpdate = true;
            }
        }

        // Rotation clamping
        if (proj.rotation < -2 * Math.PI) proj.rotation += 6.28318548;
        if (proj.rotation > 2 * Math.PI) proj.rotation -= 6.28318548;

        if (ai[0] === 0) {
            if (proj.soundDelay === 0) {
                Effects.PlaySound(Terraria.ID.SoundID.Item15, proj.position.X, proj.position.Y);
                proj.soundDelay = 14;
            }

            ai[1]++;

            if (ai[1] >= 30) {
                const vel = proj.velocity;
                vel.X = vel.X * 0.96;
                vel.Y = vel.Y + 1;
                if (vel.Y > 16) vel.Y = 16;
                proj.velocity = vel;   // reatribui o mesmo objeto modificado

                if (vel.Y > 0) {
                    if (proj.direction <= 0) {
                        if (proj.rotation < -3.948) {
                            proj.rotation = (proj.rotation * 9 - 3.948 - 6.283) / 10;
                        } else {
                            proj.rotation = (proj.rotation * 4 - 3.948) / 5;
                        }
                    } else {
                        if (proj.rotation > 2.335) {
                            proj.rotation = (proj.rotation * 9 + 2.335 + 6.283) / 10;
                        } else {
                            proj.rotation = (proj.rotation * 4 + 2.335) / 5;
                        }
                    }
                } else {
                    proj.rotation += 0.4 * proj.direction;
                }
            } else {
                proj.rotation += 0.4 * proj.direction;
            }
        } else if (ai[0] === 2) {
            // Embedded in ground
            const vel = proj.velocity;
            if (vel.Y < 0) {
                vel.Y = vel.Y * 0.5 + 1;
            } else {
                vel.Y = vel.Y + 1;
            }
            vel.X = 0;
            proj.velocity = vel;   // reatribui
            proj.rotation = 2.335;

            if (localAI[1] === 0) {
                Effects.PlaySound(Terraria.ID.SoundID.Item15, proj.position.X, proj.position.Y);
                localAI[1] = 1;
            }
        } else {
            // Returning to player
            if (proj.Center.X < player.Center.X) proj.direction = -1;
            else proj.direction = 1;

            proj.rotation = Vector2.ToRotation(proj.velocity) - 2.335;

            if (localAI[0] <= 0) {
                Effects.PlaySound(Terraria.ID.SoundID.Item15, proj.position.X, proj.position.Y);
                localAI[0] = 1;
            }

            proj.tileCollide = false;
            const speed = 40;
            const accel = 3;

            const cx = proj.position.X + proj.width * 0.5;
            const cy = proj.position.Y + proj.height * 0.5;
            const dx = player.position.X + player.width / 2 - cx;
            const dy = player.position.Y + player.height / 2 - cy;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist > 3000) { proj.Kill(); return; }

            proj.extraUpdates = Math.min(Math.floor(dist / 3000), 20);

            const norm = speed / dist;
            const tx = dx * norm;
            const ty = dy * norm;

            const vel = proj.velocity;
            let vx = vel.X, vy = vel.Y;

            if (vx < tx) { vx += accel; if (vx < 0 && tx > 0) vx += accel; }
            else if (vx > tx) { vx -= accel; if (vx > 0 && tx < 0) vx -= accel; }
            if (vy < ty) { vy += accel; if (vy < 0 && ty > 0) vy += accel; }
            else if (vy > ty) { vy -= accel; if (vy > 0 && ty < 0) vy -= accel; }

            vel.X = vx;
            vel.Y = vy;
            proj.velocity = vel;   // reatribui

            if (proj.owner === Terraria.Main.myPlayer) {
                const px = player.position.X, py = player.position.Y;
                const pw = player.width, ph = player.height;
                const jx = proj.position.X, jy = proj.position.Y;
                const jw = proj.width, jh = proj.height;
                if (jx < px + pw && jx + jw > px && jy < py + ph && jy + jh > py)
                    proj.Kill();
            }
        }
    }

    OnTileCollide(proj, oldVelocity) {
        const ai = new ProjAI(proj);
        ai[0] = 2;
        proj.netUpdate = true;

        if (oldVelocity.X === proj.velocity.X && oldVelocity.Y > 0) {
            for (let i = 0; i < 5; i++) {
                const dust = Terraria.Dust.NewDustDirect(
                    proj.Center, 1, 1, 267,
                    0, 0, 255, Color.Transparent, 1
                );
                dust.color = Color.Cyan;
                if (Math.random() < 0.1) {
                    dust.scale *= 0.45;
                    dust.velocity = Vector2.new(
                        dust.velocity.X * 1.2,
                        dust.velocity.Y - 3.5
                    );
                    dust.noGravity = true;
                } else {
                    dust.velocity = Vector2.new(
                        dust.velocity.X * 0.3,
                        -0.5
                    );
                    dust.scale *= 0.7;
                    dust.noGravity = true;
                }
                dust.position = Vector2.new(
                    dust.position.X + (Math.random() * 8 - 4),
                    dust.position.Y + 6 + Math.random() * 30
                );
            }
        }

        const vel = proj.velocity;
        const newX = vel.X !== oldVelocity.X ? -oldVelocity.X : vel.X;
        const newY = vel.Y !== oldVelocity.Y ? -oldVelocity.Y : vel.Y;
        proj.velocity = Vector2.new(newX, newY);

        return false;
    }
}