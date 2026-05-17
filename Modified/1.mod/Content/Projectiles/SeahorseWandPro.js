import { Microsoft, Modules, Terraria } from '../../TL/ModImports.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Effects, Vector2, Rectangle } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class SeahorseWandPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.MinionSpeed = 9;
        this.ViewDist = 400;
        this.BubbleTexture = null;
    }

    SetStaticDefaults() {
        Terraria.Main.projFrames[this.Type] = 4;
        Terraria.Main.projPet[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.aiStyle = -1;
        this.Projectile.width = 32;
        this.Projectile.height = 54;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 18000;
        this.Projectile.tileCollide = false;
        this.Projectile.netImportant = true;
    }

    CanCutTiles() { return false; }

    AI(proj) {
        if (!this.MinionBuff) this.MinionBuff = ModBuff.getTypeByName('SeahorseWandBuff');

        const ai = new ProjAI(proj);
        const player = Terraria.Main.player[proj.owner];

        if (!this.CheckActive(proj, player)) return;

        if (ai[0] > 0) ai[0]--;
        if (ai[2] > 0) ai[2]--;

        let target = this.GetTarget(proj, player);

        // Volta pro jogador se alvo está longe demais dele
        if (target && Vector2.Distance(target.Center, player.Center) > 800) {
            target = null;
        }

        if (target) {
            this.CombatMovement(proj, player, target);
            proj.spriteDirection = target.Center.X > proj.Center.X ? -1 : 1;

            if (ai[0] <= 0 && ai[1] <= 0 && ai[2] <= 0) {
                ai[0] = 60;
                ai[1] = 3;
                ai[2] = 60;
            }

            if (ai[1] > 0 && ai[2] <= 0 && proj.owner === Terraria.Main.myPlayer) {
                const shootType = ModProjectile.getTypeByName('SeahorseWandPro2');
                const dir = Vector2.Subtract(target.Center, proj.Center);
                const dist = dir.Length();
                if (dist > 0) {
                    const vel = Vector2.Multiply(Vector2.Divide(dir, dist), 10);
                    NewProjectile(Terraria.Projectile.GetNoneSource(), proj.Center, vel, shootType, proj.damage, 0, proj.owner, 0, 0, 0, null);
                }
                ai[1]--;
                ai[2] = 6;
                if (ai[1] <= 0) ai[0] = 180;
            }
        } else {
            this.IdleMovement(proj, player);
            proj.spriteDirection = -player.direction;
        }

        proj.direction = proj.spriteDirection;

        if (Vector2.Distance(proj.Center, player.Center) > 2000) {
            proj.Center = player.Center;
            ai[0] = 60;
            ai[1] = 0;
            ai[2] = 0;
        }

        proj.rotation = proj.velocity.X * 0.04;
        this.Animate(proj);
    }

    PostDraw(proj, lightColor) {
        if (!this.BubbleTexture) {
            this.BubbleTexture = tl.texture.load('Textures/Projectiles/Bubble2_4Frame.png');
        }

        const texture = this.BubbleTexture;
        const frameHeight = texture.Height / 4;

        const origin = Vector2.new(texture.Width / 2, frameHeight / 2);
        const pos = Vector2.Subtract(proj.Center, Terraria.Main.screenPosition);

        const color = proj.GetAlpha(lightColor);
        color.A = Math.floor(color.A * 0.35);
        color.R = Math.floor(color.R * 0.35);
        color.G = Math.floor(color.G * 0.35);
        color.B = Math.floor(color.B * 0.35);

        const frame = Rectangle.new(0, proj.frame * frameHeight, texture.Width, frameHeight);

        Terraria.Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'](
            texture, pos, frame, color, proj.rotation, origin, 1.1, Effects.SpriteEffects.None, 0
        );
    }

    CombatMovement(proj, player, target) {
        const idealPos = Vector2.new(target.Center.X, target.Center.Y - 80);
        const toPos = Vector2.Subtract(idealPos, proj.Center);
        const dist = toPos.Length();

        if (dist > 20) {
            const norm = Vector2.Divide(toPos, dist);
            const desired = Vector2.Multiply(norm, this.MinionSpeed);
            const vel = proj.velocity;
            proj.velocity = Vector2.new(
                (vel.X * 19 + desired.X) / 20,
                (vel.Y * 19 + desired.Y) / 20
            );
        } else {
            const vel = proj.velocity;
            proj.velocity = Vector2.Multiply(vel, 0.9);
        }

        if (Vector2.Distance(proj.Center, player.Center) > 900) {
            this.IdleMovement(proj, player);
        }
    }

    IdleMovement(proj, player) {
        const time = (proj.whoAmI * 131 + Terraria.Main.GameUpdateCount * 0.6) % (Math.PI * 2);
        const offsetX = player.direction * -40 + Math.sin(time) * 30;
        const offsetY = -55 + Math.cos(time * 1.1) * 15;
        const idlePos = Vector2.Add(player.Center, Vector2.new(offsetX, offsetY));
        const toIdle = Vector2.Subtract(idlePos, proj.Center);
        const dist = toIdle.Length();

        if (dist > 10) {
            const norm = Vector2.Divide(toIdle, dist);
            const desired = Vector2.Multiply(norm, this.MinionSpeed * 0.75);
            const vel = proj.velocity;
            proj.velocity = Vector2.new(
                (vel.X * 39 + desired.X) / 40,
                (vel.Y * 39 + desired.Y) / 40
            );
        } else {
            const vel = proj.velocity;
            proj.velocity = Vector2.Multiply(vel, 0.9);
        }
    }

    GetTarget(proj, player) {
        if (player.HasMinionAttackTargetNPC) {
            const t = Terraria.Main.npc[player.MinionAttackTargetNPC];
            if (t?.active && t.CanBeChasedBy(proj, false) && Vector2.Distance(proj.Center, t.Center) < this.ViewDist * 1.4) return t;
        }
        const t = proj.FindTargetWithinRange(this.ViewDist, true);
        if (t?.active && t.CanBeChasedBy(proj, false)) return t;
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

    Animate(proj) {
        proj.frameCounter++;
        if (proj.frameCounter >= 8) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % 4;
        }
    }
}