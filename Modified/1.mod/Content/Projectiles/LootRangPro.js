import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;

const EFFECT_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const PlaySound = Terraria.Audio.SoundEngine['SoundEffectInstance PlaySound(LegacySoundStyle type, Vector2 position, float pitchOffset, float volumeScale)'];

export class LootRangPro extends ModProjectile {
    static GRAB_RANGE_SQ = 1600;
    static STUN_RANGE_SQ = 400;
    static STUN_TIME = 90;
    static RING = 15;
    static RING_RADIUS = 8;
    static DUST = 90;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._stunType = -1;
        this._effect = null;
        this._effectTried = false;
    }

    SetStaticDefaults() {
        Terraria.ID.ProjectileID.Sets.TrailCacheLength[this.Type] = 8;
        Terraria.ID.ProjectileID.Sets.TrailingMode[this.Type] = 0;
    }

    SetDefaults() {
        this.Projectile.width = 30;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = 3;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 300;
        this.Projectile.extraUpdates = 1;
        this.AIType = 52;
    }

    AI(proj) {
        this.VacuumItems(proj);
        this.StunNearby(proj);
    }

    VacuumItems(proj) {
        const player = Main.player[proj.owner];
        const center = player.Center;
        const items = Main.item;
        const max = Terraria.Main.maxItems ?? 400;

        for (let i = 0; i < max; i++) {
            const drop = items[i];
            if (!drop || !drop.active) continue;
            if (drop.noGrabDelay !== 0 || drop.beingGrabbed) continue;
            if (drop.shimmerTime !== 0) continue;
            const dv = drop.velocity;
            if (drop.shimmered && dv.X * dv.X + dv.Y * dv.Y >= 0.04) continue;
            if (proj.DistanceSQ(drop.Center) >= LootRangPro.GRAB_RANGE_SQ) continue;
            drop.Center = center;
        }
    }

    StunNearby(proj) {
        if (this._stunType === -1) {
            this._stunType = ModBuff.getTypeByName('StunnedBuff') ?? -2;
        }
        if (this._stunType < 0) return;

        const npcs = Main.npc;
        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            const npc = npcs[i];
            if (!npc || !npc.CanBeChasedBy(null, false)) continue;
            if (npc.friendly || npc.CountsAsACritter) continue;
            if (npc.DistanceSQ(proj.Center) >= LootRangPro.STUN_RANGE_SQ) continue;
            if (npc.FindBuffIndex(this._stunType) >= 0) continue;

            npc.AddBuff(this._stunType, LootRangPro.STUN_TIME, true);
            PlaySound(Terraria.ID.SoundID.NPCHit1, proj.position, 0, 1);
            this.StunBurst(proj);
        }
    }

    StunBurst(proj) {
        const vel = proj.velocity;
        const spin = Math.atan2(vel.Y, vel.X);
        const cos = Math.cos(spin);
        const sin = Math.sin(spin);
        const center = proj.Center;
        const radius = LootRangPro.RING_RADIUS;

        for (let k = 0; k < LootRangPro.RING; k++) {
            const a = k * (Math.PI * 2 / LootRangPro.RING);
            const bx = Math.sin(a) * radius;
            const by = -Math.cos(a) * radius;
            const ox = bx * cos - by * sin;
            const oy = bx * sin + by * cos;

            const idx = Terraria.Dust.NewDust(center, 0, 0, LootRangPro.DUST, 0, 0, 125, Color.White, 1);
            const dust = Main.dust[idx];
            if (!dust) continue;
            dust.noGravity = true;
            dust.noLight = true;
            dust.position = Vector2.new(center.X + ox, center.Y + oy);
            dust.velocity = Vector2.new(ox / radius * 1.25, oy / radius * 1.25);
        }
    }

    PreDraw(proj, lightColor) {
        if (!this._effectTried) {
            this._effectTried = true;
            const base = this.Texture.startsWith('Textures/') ? this.Texture : 'Textures/' + this.Texture;
            const path = base + '_Effect.png';
            try {
                if (tl.file.exists(path)) this._effect = tl.texture.load(path);
                else tl.log('[Thorium] rastro nao encontrado: ' + path);
            } catch (e) {
                tl.log('[Thorium] falha ao carregar ' + path + ': ' + e);
            }
        }
        if (!this._effect) return true;

        const origin = Vector2.new(this._effect.Width * 0.5, proj.height * 0.5);
        const screen = Main.screenPosition;
        const gfx = Vector2.new(0, proj.gfxOffY);
        const trail = proj.oldPos;
        const count = trail.Length;
        const GetPos = trail.get_Item;
        const alpha = proj['Color GetAlpha(Color newColor)'](lightColor);

        for (let k = 0; k < count; k++) {
            const pos = Vector2.Add(Vector2.Add(Vector2.Subtract(GetPos(k), screen), origin), gfx);
            const fade = Color.Multiply(alpha, (count - k) / count);
            Main[EFFECT_DRAW](
                this._effect, pos, null, Color.Multiply(fade, 0.2),
                proj.rotation - 0.1, origin, proj.scale, null, 0
            );
        }

        return true;
    }
}
