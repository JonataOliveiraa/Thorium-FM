import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Effects } from '../../TL/Modules/Effects.js';
import { ThoriumPlayer } from '../Global/ThoriumPlayer.js';

const { Color, Vector2 } = Modules;

const ORBIT_RADIUS = 55;
const ORBIT_SPEED = 0.04;
const ATTACK_SPEED = 12;
const HIT_RADIUS_SQ = 28 * 28;
const SINGED_BUFF = 'SingedBuff';
const LIFE_BUFF = 'LifeRecoveryBuff';

export class NoviceClericCrossPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 5;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;
        this.Projectile.penetrate = -1;
        this.Projectile.friendly = false;
        this.Projectile.magic = true;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft = 2;
        this.Projectile.alpha = 0;
        this.Projectile.scale = 1.5;
        this.Projectile.ignoreWater = true;
    }

    AI(proj) {
        const ai = new ProjAI(proj, false);
        const localAI = new ProjAI(proj, true);
        const player = Terraria.Main.player[proj.owner];

        if (!player.active || player.dead || !ThoriumPlayer.NoviceClericSetBonus) {
            proj.Kill();
            return;
        }

        if (ai[0] === 0) {
            // Modo órbita
            proj.timeLeft = 2;
            proj.friendly = false;
            proj.rotation = 0;

            const angle = Terraria.Main.GameUpdateCount * ORBIT_SPEED + ai[1] * (Math.PI * 2 / 3);
            const cx = player.Center.X + 10;
            const cy = player.Center.Y + 25;

            const px = proj.position;
            px.X = cx + Math.cos(angle) * ORBIT_RADIUS - proj.width / 2;
            px.Y = cy + Math.sin(angle) * ORBIT_RADIUS - proj.height / 2;
            proj.position = px;

            // Velocidade zero sem criar Vector2.new
            const vel = proj.velocity;
            vel.X = 0; vel.Y = 0;
            proj.velocity = vel;

            // Luz e dust reduzidos
            if ((Terraria.Main.GameUpdateCount & 3) === 0) { // a cada 4 frames
                Effects.AddLight(proj.Center, 0.45, 0.42, 0.15);
            }
            if (Math.random() < 0.05) {
                const d = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 87, 0, 0, 220, Color.White, 0.3);
                if (d) { d.noGravity = true; d.noLight = true; }
            }

        } else {
            // Modo ataque
            proj.timeLeft = 10;
            proj.friendly = true;

            const npcIndex = Math.floor(ai[1]);
            const npc = Terraria.Main.npc[npcIndex];

            let tx, ty;
            if (!npc || !npc.active || npc.life <= 0) {
                if (localAI[1] === 0 && localAI[2] === 0) { proj.Kill(); return; }
                tx = localAI[1]; ty = localAI[2];
            } else {
                tx = localAI[1] = npc.Center.X;
                ty = localAI[2] = npc.Center.Y;
            }

            const dx = tx - proj.Center.X;
            const dy = ty - proj.Center.Y;
            proj.rotation = Math.atan2(dy, dx) + Math.PI / 2;
            const distSq = dx * dx + dy * dy;

            if (distSq < HIT_RADIUS_SQ && localAI[0] === 0) {
                localAI[0] = 1;
                const targetPos = Vector2.new(tx, ty);
                if (npc && npc.active) this.ExplodeOnTarget(npc, player);
                else this.ExplodeAtPosition(targetPos, player);
                proj.Kill();
                return;
            }

            const dist = Math.sqrt(distSq) || 1;
            const speed = Math.min(ATTACK_SPEED, dist);
            const vel = proj.velocity;
            vel.X = (dx / dist) * speed;
            vel.Y = (dy / dist) * speed;
            proj.velocity = vel;

            if ((Terraria.Main.GameUpdateCount & 1) === 0) { // a cada 2 frames
                Effects.AddLight(proj.Center, 0.4, 0.36, 0.12);
            }
            if (Math.random() < 0.2) {
                const d = Terraria.Dust.NewDustDirect(proj.position, proj.width, proj.height, 87, 0, 0, 180, Color.White, 0.4);
                if (d) { d.noGravity = true; d.noLight = true; }
            }
        }
    }

    PreDraw(proj, lightColor) {
        const ai = new ProjAI(proj, false);
        if (ai[0] === 0) return true;

        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        const origin = Vector2.new(texture.Width / 2, texture.Height / 2);
        const screenPos = Terraria.Main.screenPosition;
        const len = proj.oldPos.Length;

        for (let k = len - 1; k > 0; k--) {
            const pos = proj.oldPos.get_Item(k);
            if (pos.X === 0 && pos.Y === 0) continue;

            const t = 1 - k / len;
            const color = Color.new(255, 240, 160, Math.floor(t * 35));

            Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'](
                texture,
                Vector2.new(pos.X + origin.X - screenPos.X, pos.Y + origin.Y - screenPos.Y + proj.gfxOffY),
                null, color, Math.PI / 2, origin, proj.scale,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
            );
        }
        return true;
    }

    ExplodeOnTarget(npc, player) {
        this.SpawnExplosionDusts(npc.Center);
        npc.AddBuff(ModBuff.getTypeByName(SINGED_BUFF), 180, false);
        player['void AddBuff(int type, int time, bool fromNetPvP)'](ModBuff.getTypeByName(LIFE_BUFF), 180, false);
        Effects.PlaySound(Terraria.ID.SoundID.Item20, npc.Center.X, npc.Center.Y, 1, 0.4, 0.6);
    }

    ExplodeAtPosition(pos, player) {
        this.SpawnExplosionDusts(pos);
        player['void AddBuff(int type, int time, bool fromNetPvP)'](ModBuff.getTypeByName(LIFE_BUFF), 180, false);
        Effects.PlaySound(Terraria.ID.SoundID.Item20, pos.X, pos.Y);
    }

    SpawnExplosionDusts(center) {
        for (let i = 0; i < 20; i++) {
            const angle = (i / 20) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const d = Terraria.Dust.NewDustDirect(center, 0, 0, 87, cos * 4, sin * 4, 0, Color.White, 1.3);
            if (d) {
                d.noGravity = true;
                const p = d.position;
                p.X = center.X + cos * 4;
                p.Y = center.Y + sin * 4;
                d.position = p;
            }
        }
    }

    OnHitNPC(proj, npc) {
        const localAI = new ProjAI(proj, true);
        if (localAI[0] !== 0) return;
        localAI[0] = 1;
        this.ExplodeOnTarget(npc, Terraria.Main.player[proj.owner]);
        proj.Kill();
    }

    OnSpawn(proj) {
        ThoriumPlayer.NoviceClericCrossIds.add(proj.whoAmI);

        // Burst de surgimento
        for (let i = 0; i < 16; i++) {
            const angle = (i / 16) * Math.PI * 2;
            const cos = Math.cos(angle);
            const sin = Math.sin(angle);
            const d = Terraria.Dust.NewDustDirect(
                proj.position, proj.width, proj.height,
                87, cos * 2.5, sin * 2.5, 0, Color.White, 1.0
            );
            if (d) {
                d.noGravity = true;
                const p = d.position;
                p.X = proj.Center.X + cos * 8;
                p.Y = proj.Center.Y + sin * 8;
                d.position = p;
            }
        }
        Effects.PlaySound(Terraria.ID.SoundID.Item4, proj.position.X, proj.position.Y);
    }

    OnKill(proj) { ThoriumPlayer.NoviceClericCrossIds.delete(proj.whoAmI); }
}