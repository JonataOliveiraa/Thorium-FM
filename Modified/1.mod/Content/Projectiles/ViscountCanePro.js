import { Terraria, Modules, Microsoft } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ModBuff } from '../../TL/ModBuff.js';
import { ProjAI } from '../../TL/ProjAI.js';
import { Rectangle } from '../../TL/Modules/Rectangle.js';
import { FxHelper } from '../Global/Utils/FxHelper.js';
import { SoundHelper } from '../Global/Utils/SoundHelper.js';

const { Color, Vector2 } = Modules;
const { Main } = Terraria;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const FRAMES = 4;
const RANGE = 420;           // alcance de busca: ele enxerga pouco, e morcego
const IDLE_TIME = 30;        // ticks sem alvo antes de voltar pro jogador
const SPEED = 9;
const IDLE_OFFSET_X = -50;   // posto ao lado/acima do jogador
const IDLE_OFFSET_Y = -60;
const BLOOD_MAX = 10;        // mordidas guardadas antes de entregar a cura
const HEAL_PER_BLOOD = 2;
const DELIVER_DIST_SQ = 5625; // 75px

export class ViscountCanePro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.MinionBuff = null;
        this._eyesTex = null;
        this._texLoaded = false;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        Terraria.ID.ProjectileID.Sets.TrackMinionSpawnFromItemUse[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionTargetingFeature[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.MinionSacrificable[this.Type] = true;
        Terraria.ID.ProjectileID.Sets.CultistIsResistantTo[this.Type] = true;
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 32;
        this.Projectile.aiStyle = -1;
        this.Projectile.scale = 1.25;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 18000;
        this.Projectile.friendly = true;
        this.Projectile.minion = true;
        this.Projectile.minionSlots = 1;
        this.Projectile.tileCollide = false;
        this.Projectile.ignoreWater = true;
        this.Projectile.netImportant = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 20;
    }

    CanCutTiles(proj) {
        return false;
    }

    // ai[0] guarda o sangue das mordidas, ai[1] o timer de perseguicao, ai[2] o alvo
    OnHitNPC(proj, npc) {
        if (npc.friendly || npc.townNPC) return;
        const ai = new ProjAI(proj, false);
        if (ai[0] < BLOOD_MAX) ai[0] = ai[0] + 1;
    }

    AI(proj) {
        if (this.MinionBuff === null) this.MinionBuff = ModBuff.getTypeByName('ViscountCaneBuff');

        const player = Main.player[proj.owner];
        if (!this.CheckActive(proj, player)) return;

        const ai = new ProjAI(proj, false);
        if (ai[1] < 0) ai[1] = 0;

        const target = this.GetTarget(proj, player, ai[1] === 0, ai[2]);
        if (target) {
            ai[1] = IDLE_TIME;
            ai[2] = target.whoAmI;
            this.Attack(proj, target);
        } else {
            ai[1] = ai[1] - 1;
            ai[2] = -1;
            this.IdleMovement(proj, player, ai);
        }

        if (Vector2.Distance(proj.Center, player.Center) > 2000) {
            proj.Center = player.Center;
            ai[1] = IDLE_TIME;
            ai[2] = -1;
        }

        proj.rotation = proj.velocity.X * 0.05;
        if (Math.abs(proj.velocity.X) > 0.2) proj.spriteDirection = proj.velocity.X > 0 ? -1 : 1;

        this.Visuals(proj);
    }

    Attack(proj, target) {
        const center = proj.Center;
        const targetCenter = target.Center;
        const dx = targetCenter.X - center.X;
        const dy = targetCenter.Y - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const vel = proj.velocity;

        proj.velocity = Vector2.new(
            (vel.X * 14 + dx / dist * SPEED) / 15,
            (vel.Y * 14 + dy / dist * SPEED) / 15
        );
    }

    IdleMovement(proj, player, ai) {
        const center = proj.Center;
        const playerCenter = player.Center;
        const idleX = playerCenter.X + player.direction * IDLE_OFFSET_X;
        const idleY = playerCenter.Y + IDLE_OFFSET_Y;

        const dx = idleX - center.X;
        const dy = idleY - center.Y;
        const distSq = dx * dx + dy * dy;

        // Perto do jogador: entrega o sangue acumulado como cura
        if (ai[0] > 0 && distSq < DELIVER_DIST_SQ) {
            const heal = ai[0] * HEAL_PER_BLOOD;
            ai[0] = 0;

            try { player['void HealEffect(int healAmount, bool broadcast)'](heal, true); } catch (_) { }
            player.statLife = Math.min(player.statLife + heal, player.statLifeMax2);

            SoundHelper.play(['Item86', 'Item4'], playerCenter.X, playerCenter.Y);
            FxHelper.ring(playerCenter.X, playerCenter.Y, 12, 50, 50, 5, 3.5, 1.25, 0, 75, true);
        }

        const vel = proj.velocity;
        if (distSq > 100) {
            const dist = Math.sqrt(distSq);
            proj.velocity = Vector2.new(
                (vel.X * 39 + dx / dist * SPEED) / 40,
                (vel.Y * 39 + dy / dist * SPEED) / 40
            );
        } else {
            proj.velocity = Vector2.Multiply(vel, 0.9);
        }
    }

    GetTarget(proj, player, findTarget, oldTarget) {
        if (player.HasMinionAttackTargetNPC) {
            const marked = Main.npc[player.MinionAttackTargetNPC];
            if (marked && marked.CanBeChasedBy(proj, false) &&
                Vector2.Distance(proj.Center, marked.Center) < RANGE * 1.5) {
                return marked;
            }
        }

        const previous = oldTarget >= 0 ? Main.npc[oldTarget] : null;
        if (previous && previous.active && previous.CanBeChasedBy(proj, false)) return previous;

        if (findTarget) {
            const found = proj.FindTargetWithinRange(RANGE, true);
            if (found && found.active && found.CanBeChasedBy(proj, false)) return found;
        }

        return null;
    }

    CheckActive(proj, player) {
        if (!player || player.dead || !player.active) {
            if (player) player.ClearBuff(this.MinionBuff);
            return false;
        }
        if (player.FindBuffIndex(this.MinionBuff) >= 0) proj.timeLeft = 2;
        return true;
    }

    Visuals(proj) {
        if (++proj.frameCounter >= 5) {
            proj.frameCounter = 0;
            proj.frame = (proj.frame + 1) % FRAMES;
        }
    }

    // Olhos brilhando por cima do corpo (mesmos 4 quadros do lacaio)
    PostDraw(proj, lightColor) {
        if (!this._texLoaded) {
            this._texLoaded = true;
            try { this._eyesTex = tl.texture.load('Textures/Projectiles/ViscountCanePro_Eyes.png'); } catch (_) { }
        }
        if (!this._eyesTex) return;

        const frameHeight = Math.floor(this._eyesTex.Height / FRAMES);
        const src = Rectangle.new(0, proj.frame * frameHeight, this._eyesTex.Width, frameHeight);

        Main.spriteBatch[DRAW](
            this._eyesTex,
            Vector2.new(
                proj.Center.X - Main.screenPosition.X,
                proj.Center.Y - Main.screenPosition.Y + proj.gfxOffY
            ),
            src, Color.Multiply(Color.White, 0.35), proj.rotation,
            Vector2.new(this._eyesTex.Width / 2, frameHeight / 2), proj.scale,
            proj.spriteDirection > 0 ? SpriteEffects.FlipHorizontally : SpriteEffects.None, 0
        );
    }
}
