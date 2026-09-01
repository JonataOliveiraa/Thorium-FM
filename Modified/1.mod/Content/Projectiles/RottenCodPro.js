import { Terraria, Microsoft, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main, Lighting } = Terraria;

const DRAW_SIG = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, Vector2 scale, SpriteEffects effects, float layerDepth)';
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const GetColor = Lighting['Color GetColor(int x, int y)'];

export class RottenCodPro extends ModProjectile {
    static EXTRA_REACH = 15;
    static MAX_ORBS = 3;
    static DUST = 87;

    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this._orbType = -1;
        this._chain = null;
        this._chainTried = false;
    }

    get Size() {
        return 30;
    }

    SetDefaults() {
        this.Projectile.width = this.Size;
        this.Projectile.height = this.Size;
        this.Projectile.aiStyle = -1;
        this.Projectile.friendly = true;
        this.Projectile.tileCollide = false;
        this.Projectile.ownerHitCheck = true;
        this.Projectile.penetrate = -1;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 10;
    }

    OnSpawn(proj) {
        const ai = new ProjAI(proj, false);
        const local = new ProjAI(proj, true);
        const vel = proj.velocity;
        ai[0] = Math.atan2(vel.Y, vel.X);
        ai[2] = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
        local[0] = 0;
        proj.velocity = Vector2.Zero;
    }

    ModifyDamageHitbox(proj, hitbox) {
        const w = (proj.width / 3) | 0;
        const h = (proj.height / 3) | 0;
        hitbox.X -= w;
        hitbox.Y -= h;
        hitbox.Width += w * 2;
        hitbox.Height += h * 2;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        proj.direction = player.direction;
        player.heldProj = proj.whoAmI;

        if (player.dead || player.frozen || player.itemAnimation === 2) {
            if (player.itemAnimation === 2) player.reuseDelay = 2;
            proj.Kill();
            return;
        }

        const ai = new ProjAI(proj, false);
        const aim = ai[0];
        const reach = ai[1];
        const speed = ai[2];
        const progress = 1 - player.itemAnimation / player.itemAnimationMax;

        const angle = Math.PI + progress * Math.PI * 2;
        const swingX = Math.cos(angle) * speed;
        const swingY = Math.sin(angle) * reach;

        const cos = Math.cos(aim);
        const sin = Math.sin(aim);
        const armX = swingX * cos - swingY * sin;
        const armY = swingX * sin + swingY * cos;
        const out = speed + RottenCodPro.EXTRA_REACH;

        const anchor = player.RotatedRelativePoint(player.MountedCenter, false, true);
        proj.position = Vector2.new(
            anchor.X - proj.width * 0.5 + armX + out * cos,
            anchor.Y - proj.height * 0.5 + armY + out * sin
        );
        proj.velocity = Vector2.Zero;

        const center = proj.Center;
        proj.rotation = Math.atan2(center.Y - player.Center.Y, center.X - player.Center.X);
    }

    OnHitNPC(proj, npc) {
        if (!npc || npc.friendly || npc.townNPC) return;

        const local = new ProjAI(proj, true);
        if (local[0] === 1) return;
        local[0] = 1;

        const player = Main.player[proj.owner];

        if (this._orbType === -1) {
            this._orbType = ModProjectile.getTypeByName('HealingOrbYellow') ?? -2;
        }
        if (this._orbType < 0) return;
        if (player.ownedProjectileCounts[this._orbType] >= RottenCodPro.MAX_ORBS) return;

        NewProjectile(
            null, npc.Center,
            Vector2.new(Rand.Next(-5, 5), Rand.Next(-5, 5)),
            this._orbType, 0, 0, proj.owner, 0, 0, 0, null
        );

        for (let i = 0; i < 10; i++) {
            const idx = Terraria.Dust.NewDust(
                npc.position, npc.width, npc.height, RottenCodPro.DUST,
                Rand.Next(-5, 5), Rand.Next(-5, 5), 0, Color.new(255, 255, 255, 0), 1
            );
            const dust = Main.dust[idx];
            if (!dust) continue;
            dust.noGravity = true;
            dust.noLight = true;
        }
    }

    PreDraw(proj, lightColor) {
        if (!this._chainTried) {
            this._chainTried = true;
            const base = this.Texture.startsWith('Textures/') ? this.Texture : 'Textures/' + this.Texture;
            const path = base + '_Chain.png';
            try {
                if (tl.file.exists(path)) this._chain = tl.texture.load(path);
                else tl.log('[Thorium] corrente nao encontrada: ' + path);
            } catch (e) {
                tl.log('[Thorium] falha ao carregar ' + path + ': ' + e);
            }
        }
        if (!this._chain || !Main.spriteBatch) return true;

        const player = Main.player[proj.owner];
        if (!player || !player.active) return true;

        const arm = player.MountedCenter;
        const center = proj.Center;

        const dx = arm.X - center.X;
        const dy = arm.Y - center.Y;
        const span = Math.sqrt(dx * dx + dy * dy);
        if (span <= 0) return true;

        const stepH = this._chain.Height;
        if (!(stepH > 0)) return true;

        const ux = dx / span;
        const uy = dy / span;
        const rotation = Math.atan2(dy, dx) + Math.PI / 2;
        const origin = Vector2.new(this._chain.Width * 0.5, stepH * 0.5);
        const screen = Main.screenPosition;

        for (let travelled = 0; travelled < span; travelled += stepH) {
            const px = center.X + ux * travelled;
            const py = center.Y + uy * travelled;
            Main.spriteBatch[DRAW_SIG](
                this._chain,
                Vector2.new(px - screen.X, py - screen.Y),
                null,
                GetColor((px / 16) | 0, (py / 16) | 0),
                rotation,
                origin,
                Vector2.One,
                Microsoft.Xna.Framework.Graphics.SpriteEffects.None,
                0
            );
        }

        return true;
    }
}
