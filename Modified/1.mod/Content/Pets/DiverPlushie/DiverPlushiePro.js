import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModItem } from './../../../TL/ModItem.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';

const { Color, Rand, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];

const MAX_PROJ = Terraria.Main.maxProjectiles ?? 1000;
const _boredom = new Int16Array(MAX_PROJ);
const _easterEgg = new Int16Array(MAX_PROJ);
const _latch = new Uint8Array(MAX_PROJ);
const _bubbleFrame = new Int8Array(MAX_PROJ);
const _bubbleCounter = new Int16Array(MAX_PROJ);

export class DiverPlushiePro extends ModProjectile {
    static BOREDOM_MAX = 300;
    static HEAD_OFFSET = 26;
    static SEEK_RANGE_SQ = 250000;
    static FAR_SQ = 1000000;
    static VANILLA_DIVING_HELMET = 27;
    static HEART_GORE = 331;
    static EGG_DELAY = 90;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
        this.bubble = null;
        this.bubbleTried = false;
        this.modHelmetSlot = -1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 6;
        Main.projPet[this.Type] = true;
    }

    SetDefaults() {
        this.CloneDefaults(380);
        this.Projectile.width = 30;
        this.Projectile.height = 32;
        this.Projectile.tileCollide = false;
        this.AIType = 380;
    }

    OnSpawn(proj) {
        const slot = proj.whoAmI;
        _boredom[slot] = 0;
        _easterEgg[slot] = 0;
        _latch[slot] = 0;
        _bubbleFrame[slot] = 0;
        _bubbleCounter[slot] = 0;
    }

    PreAI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('DiverPlushieBuff');

        const player = Main.player[proj.owner];
        const slot = proj.whoAmI;

        if (!player.active) {
            proj.active = false;
            return false;
        }
        if (!player.dead && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        proj.tileCollide = false;
        proj.spriteDirection = 1;

        if (player.afkCounter > 0) {
            if (_boredom[slot] < DiverPlushiePro.BOREDOM_MAX) _boredom[slot]++;
        } else {
            _boredom[slot] = 0;
            _easterEgg[slot] = 0;
            _latch[slot] = 0;
        }

        if (proj.DistanceSQ(player.Center) > DiverPlushiePro.FAR_SQ) proj.Center = player.Center;

        if (!this.WantsToLatch(proj, player, slot)) return true;

        this.SeekHead(proj, player, slot);
        this.Animate(proj);
        return false;
    }

    WantsToLatch(proj, player, slot) {
        if (_boredom[slot] < DiverPlushiePro.BOREDOM_MAX) return false;

        const mount = player.mount;
        if (mount && mount.Active) {
            _latch[slot] = 0;
            _boredom[slot] = 0;
            return false;
        }
        if (player.sleeping && player.sleeping.isSleeping) {
            _latch[slot] = 0;
            _boredom[slot] = 0;
            return false;
        }

        const head = this.HeadPosition(player);
        if (proj.DistanceSQ(head) >= DiverPlushiePro.SEEK_RANGE_SQ) {
            _latch[slot] = 0;
            _boredom[slot] = 0;
            return false;
        }

        return true;
    }

    HeadPosition(player) {
        return Vector2.new(player.Center.X, player.Center.Y - DiverPlushiePro.HEAD_OFFSET);
    }

    SeekHead(proj, player, slot) {
        const head = this.HeadPosition(player);
        const dx = head.X - proj.Center.X;
        const dy = head.Y - proj.Center.Y;
        const len = Math.sqrt(dx * dx + dy * dy);

        if (len > 0) {
            const vel = proj.velocity;
            proj.velocity = Vector2.new(
                (vel.X * 20 + (dx / len) * 2) / 21,
                (vel.Y * 20 + (dy / len) * 2) / 21
            );
        }

        if (dx * dx + dy * dy <= 1) {
            _latch[slot] = 1;
            if (proj.frame < 4) proj.frame = 4;
        }

        if (!_latch[slot]) return;

        proj.rotation = 0;
        proj.velocity = Vector2.Zero;
        proj.gfxOffY = player.gfxOffY;

        if (!this.WearingDivingHelmet(player)) return;

        _easterEgg[slot]++;
        if (_easterEgg[slot] <= DiverPlushiePro.EGG_DELAY) return;
        _easterEgg[slot] = 0;

        const index = NewGore(
            Vector2.new(proj.Center.X, proj.Center.Y - 12),
            Vector2.new(Rand.NextFloat(-1.5, 1.5), Rand.NextFloat(-2, -1)),
            DiverPlushiePro.HEART_GORE, 1
        );
        const gore = Main.gore[index];
        if (gore) gore.sticky = false;
    }

    WearingDivingHelmet(player) {
        if (player.head === DiverPlushiePro.VANILLA_DIVING_HELMET) return true;

        if (this.modHelmetSlot === -1) {
            this.modHelmetSlot = ModItem.getByName('DiverHelmet')?.Item?.headSlot ?? -2;
        }
        return this.modHelmetSlot >= 0 && player.head === this.modHelmetSlot;
    }

    AI(proj) {
        proj.rotation = proj.velocity.X * 0.05;
        this.Animate(proj);
    }

    Animate(proj) {
        const slot = proj.whoAmI;
        const latched = _latch[slot] === 1;
        const max = Main.projFrames[this.Type];

        _bubbleCounter[slot]++;
        if (_bubbleCounter[slot] > (latched ? 12 : 6)) {
            _bubbleFrame[slot]++;
            _bubbleCounter[slot] = 0;
        }
        if (_bubbleFrame[slot] >= 4) _bubbleFrame[slot] = 0;

        proj.frameCounter++;
        if (latched) {
            if (proj.frameCounter > 60) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= max) proj.frame = 4;
        } else {
            if (proj.frameCounter > 6) {
                proj.frame++;
                proj.frameCounter = 0;
            }
            if (proj.frame >= 4) proj.frame = 0;
        }
    }

    PostDraw(proj, lightColor) {
        if (proj.wet) return;

        if (!this.bubbleTried) {
            this.bubbleTried = true;
            const path = 'Textures/Projectiles/Bubble2_4Frame.png';
            try {
                if (tl.file.exists(path)) this.bubble = tl.texture.load(path);
                else tl.log('[Thorium] bolha nao encontrada: ' + path);
            } catch (e) {
                tl.log('[Thorium] falha ao carregar ' + path + ': ' + e);
            }
        }
        if (!this.bubble) return;

        const frameH = (this.bubble.Height / 4) | 0;
        const frame = _bubbleFrame[proj.whoAmI];
        const source = Rectangle.new(0, frame * frameH, this.bubble.Width, frameH);
        const origin = Vector2.new(this.bubble.Width * 0.5, frameH * 0.5 + 2);
        const pos = Vector2.Subtract(
            Vector2.new(proj.Center.X, proj.Center.Y + proj.gfxOffY),
            Main.screenPosition
        );

        Main[ENTITY_DRAW](
            this.bubble, pos, source,
            Color.Multiply(proj['Color GetAlpha(Color newColor)'](lightColor), 0.25),
            proj.rotation, origin, 1, null, 0
        );
    }
}
