import { Terraria, Modules } from "../../TL/ModImports.js";
import { ModProjectile } from "../../TL/ModProjectile.js";
import { ModBuff } from "../../TL/ModBuff.js";
import { ProjAI } from "../../TL/ProjAI.js";
import { Effects } from "../../TL/Modules/Effects.js";
import { ThoriumPlayer } from "../Global/ThoriumPlayer.js";

const { Color, Vector2 } = Modules;
const StrikeNPC = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';

const EMPOWER_MAX = 5;

const UNDEAD_NPCS = new Set([
    3, 21, 31, 34, 35, 36, 39, 40, 41,
    44, 45, 77, 110, 127, 128, 129, 130, 131,
    132, 140, 161, 162, 167, 186, 187, 188, 189
]);

export class PalmCrossPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/Healer/' + this.constructor.name;
    }

    get DustType() {
        return ThoriumPlayer.RadiantCorruptionActive ? 86 : 87;
    }

    SetDefaults() {
        this.Projectile.width = 10;
        this.Projectile.height = 10;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.alpha = 255;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = false;
        this.Projectile.magic = true;
    }

    AI(proj) {
        const localAI = new ProjAI(proj, true);
        const ai = new ProjAI(proj, false);
        const player = Terraria.Main.player[proj.owner];
        const dustType = this.DustType;

        // ai[0] = empower (0-5), localAI[0] = explosion flag, localAI[1] = timer

        const empower = ai[0];

        const dustIdx = Terraria.Dust.NewDust(
            proj.position, proj.width, proj.height,
            dustType, 0, 0, 100, Color.White,
            0.5 + empower * 0.1
        );
        const dust = Terraria.Main.dust[dustIdx];
        if (dust) {
            dust.noGravity = true;
            const vel = dust.velocity;
            vel.X *= 0.75;
            vel.Y *= 0.75;
            const ox = Math.floor(Math.random() * 41) - 20;
            const oy = Math.floor(Math.random() * 41) - 20;
            const pos = dust.position;
            pos.X += ox;
            pos.Y += oy;
            dust.position = pos;
            vel.X = -ox * (0.035 + empower * 0.0065);
            vel.Y = -oy * (0.035 + empower * 0.0065);
            dust.velocity = vel;
        }

        localAI[1]++;
        if (localAI[1] >= 12) {
            if (empower < EMPOWER_MAX) {
                ai[0]++;
                const newEmpower = ai[0];
                if (newEmpower === EMPOWER_MAX) {
                    Effects.PlaySound(Terraria.ID.SoundID.MaxMana, player.Center.X, player.Center.Y);
                    for (let i = 0; i < 30; i++) {
                        const angle = (i / 30) * Math.PI * 2;
                        const offset = Vector2.new(Math.cos(angle) * 16, Math.sin(angle) * 16);
                        const d = Terraria.Dust.NewDustDirect(proj.Center, 0, 0, dustType, 0, 0, 255, Color.White, 1.0);
                        if (d) {
                            d.noGravity = true;
                            const dpos = d.position;
                            dpos.X = proj.Center.X + offset.X;
                            dpos.Y = proj.Center.Y + offset.Y;
                            d.position = dpos;
                            const dvel = d.velocity;
                            dvel.X = offset.X / 16;
                            dvel.Y = offset.Y / 16;
                            d.velocity = dvel;
                        }
                    }
                } else {
                    Effects.PlaySound(Terraria.ID.SoundID.Item24, player.Center.X, player.Center.Y);
                }
            }
            localAI[1] = 0;
        }

        player.SetDummyItemTime(2);

        if (player.channel && !player.noItems && !player.CCed) {
            proj.timeLeft = 10;
            const pos = proj.position;
            pos.X = player.Center.X - 5 + player.direction * 80;
            pos.Y = player.Center.Y - 18;
            proj.position = pos;
            proj.gfxOffY = player.gfxOffY;

            if (Terraria.Main.myPlayer === proj.owner) {
                player.ChangeDir(Terraria.Main.MouseWorld.X > player.Center.X ? 1 : -1);
            }
        } else {
            if (localAI[0] === 0) {
                localAI[0] = 1;
                proj.friendly = true;
                proj.velocity = Vector2.new(0, 0);
                proj.tileCollide = false;
                proj.alpha = 255;

                const center = proj.Center;
                const size = 45 + ai[0] * 14;
                proj.width = size;
                proj.height = size;
                proj.Center = center;

                Effects.PlaySound(Terraria.ID.SoundID.Item20, proj.Center.X, proj.Center.Y);

                const speed = 3.5 + ai[0] * 0.5;
                const spawnRing = (ringSpeed) => {
                    for (let i = 0; i < 50; i++) {
                        const angle = (i / 50) * Math.PI * 2;
                        const offset = Vector2.new(Math.cos(angle) * 2, Math.sin(angle) * 2);
                        const d = Terraria.Dust.NewDustDirect(proj.Center, 0, 0, dustType, 0, 0, 0, Color.White, 1.35);
                        if (d) {
                            d.noGravity = true;
                            const dpos = d.position;
                            dpos.X = proj.Center.X + offset.X;
                            dpos.Y = proj.Center.Y + offset.Y;
                            d.position = dpos;
                            const norm = Math.sqrt(offset.X ** 2 + offset.Y ** 2) || 1;
                            const dvel = d.velocity;
                            dvel.X = (offset.X / norm) * ringSpeed;
                            dvel.Y = (offset.Y / norm) * ringSpeed;
                            d.velocity = dvel;
                        }
                    }
                };

                spawnRing(speed);
                if (ai[0] >= EMPOWER_MAX) spawnRing(speed / 3);
            }

            proj.timeLeft = Math.min(proj.timeLeft, 6);
        }
    }

    OnHitNPC(proj, npc) {
        npc.immune[proj.owner] = 20;

        const ai = new ProjAI(proj, false);
        const empower = ai[0];

        // Bônus de empower
        if (empower > 0) {
            const bonus = Math.floor(proj.damage * empower * 0.2);
            if (bonus > 0) npc[StrikeNPC](bonus, 0, npc.direction ?? 1, false, false, false);
        }

        if (UNDEAD_NPCS.has(npc.type)) {
            npc[StrikeNPC](proj.damage, 0, npc.direction ?? 1, false, false, false);
        }

        if (ThoriumPlayer.RadiantCorruptionActive) {
            npc.AddBuff(Terraria.ID.BuffID.ShadowFlame, 90, false);
        } else {
            npc.AddBuff(ModBuff.getTypeByName('SingedBuff'), 90, false);
        }
    }
}