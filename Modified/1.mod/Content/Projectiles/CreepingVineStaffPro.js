import { Terraria, Modules } from '../../TL/ModImports.js';
import { ModProjectile } from '../../TL/ModProjectile.js';
import { ProjAI } from '../../TL/ProjAI.js';

const { Color, Rand, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';
const SPRITE_DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const PlaySoundLegacy = Terraria.Audio.SoundEngine['void PlaySound(int type, Vector2 position, int style, float pitchOffset)'];
const FindTargetWithinRange = Terraria.Projectile['NPC FindTargetWithinRange(float maxRange, bool checkCanHit)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];

const TILE_SIZE = 16;

const FRAMES = 4;
const FRAME_RATE = 3;

const WOBBLE_EVERY = 4;
const WOBBLE_PUSH = 0.5;

const WOBBLE_WARMUP = 20;

const TARGET_RANGE = 400;

const HOME_LEASH_SQ = 160000;

const HOME_DEADZONE_SQ = 4096;

const CHASE_SPEED = 4;
const RETURN_SPEED = 5;
const INERTIA = 20;

const SEARCH_EVERY = 10;

const ROTATION_OFFSET = Math.PI / 2;

const BASE_ORIGIN_X = 15;
const BASE_ORIGIN_Y = 15;

const DUST_LEAF = 39;
const DUST_CLUMP = 38;
const KILL_LEAF_COUNT = 8;
const KILL_CLUMP_COUNT = 5;
const KILL_BURST_COUNT = 5;
const KILL_BASE_ALPHA = 75;
const KILL_BASE_SCALE = 1.25;
const KILL_BURST_ALPHA = 0;
const KILL_BURST_SCALE = 1;
const KILL_BASE_SPREAD_X = 1;
const KILL_BASE_RISE_MIN = -4;
const KILL_BASE_RISE_MAX = -2;
const KILL_BURST_SPREAD = 4;

export class CreepingVineStaffPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.Chain = this.Texture + '_Chain';
        this.Base = this.Texture + '_Base';
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = FRAMES;
        this.ChainTexture = tl.texture.load('Textures/' + this.Chain + '.png');
        this.BaseTexture = tl.texture.load('Textures/' + this.Base + '.png');
    }

    SetDefaults() {
        this.Projectile.width = 32;
        this.Projectile.height = 30;
        this.Projectile.aiStyle = -1;

        this.Projectile.sentry = true;
        this.Projectile.tileCollide = false;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.timeLeft = 36000;
        this.Projectile.netImportant = true;
        this.Projectile.usesLocalNPCImmunity = true;
        this.Projectile.localNPCHitCooldown = 25;
    }

    OnSpawn(proj) {
        const local = new ProjAI(proj, true);
        new ProjAI(proj, false)[2] = 0;
        local[0] = 0;
        local[1] = 0;
    }

    AI(proj) {
        if (!this.AnchorAlive(proj)) {
            proj.Kill();
            return;
        }

        this.Move(proj);

        this.Orient(proj);
        this.Animate(proj);
    }

    AnchorAlive(proj) {
        const ai = new ProjAI(proj, false);
        const tile = Main.tile.get_Item(
            Math.floor(ai[0] / TILE_SIZE),
            Math.floor(ai[1] / TILE_SIZE)
        );
        return !!tile && tile['bool active()']();
    }

    Move(proj) {
        const ai = new ProjAI(proj, false);

        const wobble = ai[2] + 1;
        ai[2] = wobble;

        if (wobble % WOBBLE_EVERY === 0) {
            const vel = proj.velocity;
            proj.velocity = Vector2.new(
                vel.X + Rand.NextFloat(-WOBBLE_PUSH, WOBBLE_PUSH),
                vel.Y + Rand.NextFloat(-WOBBLE_PUSH, WOBBLE_PUSH)
            );
        }

        if (wobble <= WOBBLE_WARMUP) return;

        const center = proj.Center;
        const homeX = ai[0];
        const homeY = ai[1];
        const dxHome = homeX - center.X;
        const dyHome = homeY - center.Y;

        const distHomeSQ = dxHome * dxHome + dyHome * dyHome;

        if (distHomeSQ < HOME_LEASH_SQ) {
            const target = this.Nearest(proj);
            if (target) {
                const targetCenter = target.Center;
                this.Steer(proj, targetCenter.X - center.X, targetCenter.Y - center.Y, CHASE_SPEED);
                return;
            }
        }

        if (distHomeSQ <= HOME_DEADZONE_SQ) return;

        this.Steer(proj, dxHome, dyHome, RETURN_SPEED);
    }

    Nearest(proj) {
        const local = new ProjAI(proj, true);
        const cached = local[1] | 0;

        if (local[0] > 0) {
            local[0] = local[0] - 1;

            if (cached > 0) {
                const npc = Main.npc[cached - 1];
                if (npc && npc.active && npc.CanBeChasedBy(proj, false)) return npc;
            }
            return null;
        }

        local[0] = SEARCH_EVERY;

        const found = FindTargetWithinRange(proj, TARGET_RANGE, true);
        const valid = found && found.active ? found : null;

        local[1] = valid ? valid.whoAmI + 1 : 0;
        return valid;
    }

    Steer(proj, dx, dy, speed) {
        const len = Math.sqrt(dx * dx + dy * dy);
        const scale = len > 0 ? speed / len : 0;
        const vel = proj.velocity;

        proj.velocity = Vector2.new(
            (vel.X * INERTIA + dx * scale) / (INERTIA + 1),
            (vel.Y * INERTIA + dy * scale) / (INERTIA + 1)
        );
    }

    Orient(proj) {
        const vel = proj.velocity;
        proj.rotation = Math.atan2(vel.Y, vel.X) + ROTATION_OFFSET;
    }

    Animate(proj) {
        let frame = proj.frame;
        let counter = proj.frameCounter + 1;

        if (counter > FRAME_RATE) {
            frame++;
            counter = 0;
        }
        if (frame >= FRAMES) frame = 0;

        proj.frame = frame;
        proj.frameCounter = counter;
    }

    DrawChain(projectile, to, texture2D) {
        const Draw = Main.spriteBatch[SPRITE_DRAW];
        const screenPos = Main.screenPosition;
        let vector2_1 = projectile.Center;
        const vector2_2 = Vector2.new(texture2D.Width * 0.5, texture2D.Height * 0.5);
        const height = texture2D.Height;
        let vector2_3 = Vector2.Subtract(to, vector2_1);
        const num = Math.atan2(vector2_3.Y, vector2_3.X) - 1.57;
        let flag = true;
        if (Number.isNaN(vector2_1.X) || Number.isNaN(vector2_1.Y)) {
            flag = false;
        }
        if (Number.isNaN(vector2_3.X) || Number.isNaN(vector2_3.Y)) {
            flag = false;
        }
        while (flag) {
            if (vector2_3['float Length()']() < height + 1) {
                flag = false;
                break;
            }
            const vector2_4 = vector2_3;
            vector2_4['void Normalize()']();
            vector2_1 = Vector2.Add(vector2_1, Vector2.Multiply(vector2_4, height));
            vector2_3 = Vector2.Subtract(to, vector2_1);
            const color = GetColor(Math.floor(vector2_1.X / 16), Math.floor(vector2_1.Y / 16));
            Draw(texture2D, Vector2.Subtract(vector2_1, screenPos), null, color, num, vector2_2, 1, null, 0);
        }
    }

    PreDraw(proj, lightColor) {
        if (this.ChainTexture) {
            const ai = new ProjAI(proj, false);
            this.DrawChain(proj, Vector2.new(ai[0], ai[1]), this.ChainTexture);
        }
        return true;
    }

    PostDraw(proj, lightColor) {
        if (!this.BaseTexture) return;

        const ai = new ProjAI(proj, false);
        const homeX = ai[0];
        const homeY = ai[1];
        const tint = proj['Color GetAlpha(Color newColor)'](
            GetColor((homeX / 16) | 0, (homeY / 16) | 0)
        );

        const screen = Main.screenPosition;
        Main[ENTITY_DRAW](
            this.BaseTexture,
            Vector2.new(homeX - screen.X, homeY - screen.Y),
            null, tint, 0,

            Vector2.new(BASE_ORIGIN_X, BASE_ORIGIN_Y),
            1, null, 0
        );
    }

    OnKill(proj, timeLeft) {
        PlaySoundLegacy(Terraria.ID.SoundID.Grass, proj.position, 0, 1);

        const ai = new ProjAI(proj, false);
        const home = Vector2.new(ai[0], ai[1]);
        const width = proj.width;
        const height = proj.height;

        this.BaseDust(home, width, height, DUST_LEAF, KILL_LEAF_COUNT);
        this.BaseDust(home, width, height, DUST_CLUMP, KILL_CLUMP_COUNT);

        for (let i = 0; i < KILL_BURST_COUNT; i++) {
            const dust = NewDustDirect(
                proj.position, width, height, DUST_LEAF,
                Rand.Next(-KILL_BURST_SPREAD, KILL_BURST_SPREAD),
                Rand.Next(-KILL_BURST_SPREAD, KILL_BURST_SPREAD),
                KILL_BURST_ALPHA, Color.Transparent, KILL_BURST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
    }

    BaseDust(home, width, height, type, count) {
        for (let i = 0; i < count; i++) {
            NewDustDirect(
                home, width, height, type,
                Rand.Next(-KILL_BASE_SPREAD_X, KILL_BASE_SPREAD_X),
                Rand.Next(KILL_BASE_RISE_MIN, KILL_BASE_RISE_MAX),
                KILL_BASE_ALPHA, Color.Transparent, KILL_BASE_SCALE
            );
        }
    }
}
