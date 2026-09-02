import { Terraria, Modules } from './../../TL/ModImports.js';
import { ModProjectile } from './../../TL/ModProjectile.js';
import { ProjAI } from './../../TL/ProjAI.js';
import { MiscHelper } from './../Global/Utils/MiscHelper.js';
import { ThoriumPlayer } from './../Global/ThoriumPlayer.js';

const { Main } = Terraria;
const { Color, MathHelper, Rand, Vector2 } = Modules;

const EntitySpriteDraw = Main['void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)'];
const GetColor = Terraria.Lighting['Color GetColor(int x, int y)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewDustDirect = Terraria.Dust['Dust NewDustDirect(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const CHAIN_PATH = 'Textures/Projectiles/ZephyrsGripPro_Chain.png';
const EFFECT_PATH = 'Textures/Projectiles/ZephyrsGripPro_Effect.png';

const GRAPPLE_RANGE = 150;
const RETREAT_SPEED = 11;
const PULL_SPEED = 8;
const HOOK_ARRIVE_SQ = 144;
const PLAYER_ARRIVE = 12;

const DURATION_MIN = 0.25;
const DURATION_SPAN = 0.5;

const LATCH_DUST = 57;
const LATCH_DUST_COUNT = 10;
const LATCH_DUST_SPEED = 3;
const LATCH_DUST_SCALE = 1.2;

const STATE_PLAIN = 0;
const STATE_SEEK = 1;
const STATE_PULL = 2;

const MAX_PROJ = Main.maxProjectiles ?? 1000;
const _state = new Uint8Array(MAX_PROJ);
const _targetX = new Float32Array(MAX_PROJ);
const _targetY = new Float32Array(MAX_PROJ);
const _hatchling = new Int16Array(MAX_PROJ);

let _hatchlingType = -1;
function hatchlingType() {
    if (_hatchlingType === -1) _hatchlingType = ModProjectile.getTypeByName('ZephyrsGripHatchlingPro') ?? -2;
    return _hatchlingType;
}

export class ZephyrsGripPro extends ModProjectile {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
        this.ChainTexture = null;
        this.EffectTexture = null;
    }

    SetStaticDefaults() {
        this.ChainTexture = tl.texture.load(CHAIN_PATH);
        this.EffectTexture = tl.texture.load(EFFECT_PATH);
    }

    SetDefaults() {
        this.CloneDefaults(Terraria.ID.ProjectileID.GemHookDiamond);
        this.Projectile.width = 18;
        this.Projectile.height = 18;
        this.Projectile.netImportant = true;
        this.Projectile.aiStyle = 7;
        this.Projectile.friendly = true;
        this.Projectile.penetrate = -1;
        this.Projectile.tileCollide = false;
        this.Projectile.timeLeft *= 10;
        this.AIType = Terraria.ID.ProjectileID.GemHookDiamond;
    }

    OnSpawn(proj) {
        const i = proj.whoAmI;
        _state[i] = STATE_PLAIN;
        _targetX[i] = 0;
        _targetY[i] = 0;
        _hatchling[i] = -1;

        const type = hatchlingType();
        if (type < 0) return;
        if (!ThoriumPlayer.zephyrsGripCanSpawnHatchling) return;

        const player = Main.player[proj.owner];
        const velocity = proj.velocity;
        const length = Math.sqrt(velocity.X * velocity.X + velocity.Y * velocity.Y);
        if (length <= 0) return;

        const center = proj.Center;
        const endX = center.X + velocity.X / length * GRAPPLE_RANGE;
        const endY = center.Y + velocity.Y / length * GRAPPLE_RANGE;
        const tileX = Math.floor(endX / 16);
        const tileY = Math.floor(endY / 16);

        if (tileY >= player.Center.Y / 16) return;
        if (!MiscHelper.CanHitLine(Math.floor(center.X / 16), Math.floor(center.Y / 16), tileX, tileY)) return;

        const worldX = tileX * 16 + 8;
        const worldY = tileY * 16 + 8;
        const mounted = player.MountedCenter;
        const angle = Math.atan2(worldY - mounted.Y, worldX - mounted.X);
        const ratio = MathHelper.Clamp(Math.abs(-angle - MathHelper.PiOver2) / MathHelper.PiOver2, 0, 1);
        const duration = Math.round(60 * (DURATION_MIN + ratio * DURATION_SPAN));

        const index = NewProjectile(
            null, Vector2.new(worldX, worldY), Vector2.Zero,
            type, 0, 0, proj.owner, i + 1, duration, 0, null
        );
        if (!(index >= 0 && index < MAX_PROJ)) return;

        _state[i] = STATE_SEEK;
        _targetX[i] = worldX;
        _targetY[i] = worldY;
        _hatchling[i] = index;
    }

    AI(proj) {
        const i = proj.whoAmI;
        const player = Main.player[proj.owner];

        if (_state[i] === STATE_PULL) {
            this.PullPlayer(proj, i, player);
            return;
        }

        const ai = new ProjAI(proj);

        if (ai[0] === 0) {
            if (_state[i] === STATE_SEEK && this.ReachedHatchling(proj, i)) return;
            if (player.Distance(proj.Center) > GRAPPLE_RANGE) this.Retract(proj, i);
            return;
        }

        if (ai[0] === 1) {
            _state[i] = STATE_PLAIN;
            const toPlayer = Vector2.Subtract(player.MountedCenter, proj.Center);
            const distance = toPlayer['float Length()']();
            if (distance > 0) {
                const scale = RETREAT_SPEED / distance;
                proj.velocity = Vector2.new(toPlayer.X * scale, toPlayer.Y * scale);
            }
        }
    }

    ReachedHatchling(proj, i) {
        const center = proj.Center;
        const dx = _targetX[i] - center.X;
        const dy = _targetY[i] - center.Y;
        if (dx * dx + dy * dy > HOOK_ARRIVE_SQ) return false;

        if (!this.LivingHatchling(i)) {
            this.Retract(proj, i);
            return true;
        }

        _state[i] = STATE_PULL;
        this.Pin(proj, i);

        for (let d = 0; d < LATCH_DUST_COUNT; d++) {
            const dust = NewDustDirect(
                proj.position, proj.width, proj.height, LATCH_DUST,
                Rand.NextFloat(-LATCH_DUST_SPEED, LATCH_DUST_SPEED),
                Rand.NextFloat(-LATCH_DUST_SPEED, LATCH_DUST_SPEED),
                0, Color.White, LATCH_DUST_SCALE
            );
            if (dust) dust.noGravity = true;
        }
        return true;
    }

    PullPlayer(proj, i, player) {
        if (!this.LivingHatchling(i)) {
            this.Retract(proj, i);
            return;
        }

        this.Pin(proj, i);

        const mounted = player.MountedCenter;
        const dx = _targetX[i] - mounted.X;
        const dy = _targetY[i] - mounted.Y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance <= PLAYER_ARRIVE) return;

        player.velocity = Vector2.new(dx / distance * PULL_SPEED, dy / distance * PULL_SPEED);
    }

    LivingHatchling(i) {
        const index = _hatchling[i];
        if (index < 0) return null;
        const hatchling = Main.projectile[index];
        if (!hatchling || !hatchling.active) return null;
        if (hatchling.type !== hatchlingType()) return null;
        return hatchling;
    }

    Pin(proj, i) {
        proj.Center = Vector2.new(_targetX[i], _targetY[i]);
        proj.velocity = Vector2.Zero;
    }

    Retract(proj, i) {
        const hatchling = this.LivingHatchling(i);
        if (hatchling) hatchling.Kill();
        _state[i] = STATE_PLAIN;
        _hatchling[i] = -1;
        new ProjAI(proj)[0] = 1;
    }

    CanUseGrapple(player, type) {
        const hatch = hatchlingType();
        if (hatch < 0) return true;
        return !(player.ownedProjectileCounts[type] > 0 && player.ownedProjectileCounts[hatch] > 0);
    }

    UseGrapple(player, type) {
        if (player.ownedProjectileCounts[type] >= 1) {
            let oldest = null;
            for (let i = 0; i < MAX_PROJ; i++) {
                const proj = Main.projectile[i];
                if (proj && proj.active && proj.type === type && proj.owner === player.whoAmI
                    && (!oldest || proj.timeLeft < oldest.timeLeft)) oldest = proj;
            }
            if (oldest) oldest.Kill();
        }
        return type;
    }

    OnKill(proj, timeLeft) {
        _state[proj.whoAmI] = STATE_PLAIN;
        _hatchling[proj.whoAmI] = -1;
        ThoriumPlayer.zephyrsGripCanSpawnHatchling = false;
    }

    PreDraw(proj, lightColor) {
        if (!this.ChainTexture) return true;

        const screenPos = Main.screenPosition;
        const playerCenter = Main.player[proj.owner].MountedCenter;
        let center = proj.Center;
        let toPlayer = Vector2.Subtract(playerCenter, center);
        let distance = toPlayer['float Length()']();
        const rotation = Vector2.ToRotation(toPlayer) - MathHelper.PiOver2;
        const origin = Vector2.new(this.ChainTexture.Width / 2, this.ChainTexture.Height / 2);

        while (distance > this.ChainTexture.Height && !Number.isNaN(distance)) {
            toPlayer = Vector2.Divide(toPlayer, distance);
            toPlayer = Vector2.Multiply(toPlayer, this.ChainTexture.Height);
            center = Vector2.Add(center, toPlayer);
            toPlayer = Vector2.Subtract(playerCenter, center);
            distance = toPlayer['float Length()']();

            EntitySpriteDraw(
                this.ChainTexture, Vector2.Subtract(center, screenPos), null,
                GetColor(center.X / 16, center.Y / 16), rotation, origin, 1, null, 0
            );
        }

        return true;
    }

    PostDraw(proj, lightColor) {
        if (!this.EffectTexture) return;

        const origin = Vector2.new(this.EffectTexture.Width / 2, this.EffectTexture.Height / 2);
        const position = Vector2.new(
            proj.Center.X - Main.screenPosition.X,
            proj.Center.Y + proj.gfxOffY - Main.screenPosition.Y
        );

        EntitySpriteDraw(
            this.EffectTexture, position, null, Color.Multiply(Color.White, proj.Opacity),
            proj.rotation, origin, proj.scale, null, 0
        );
    }
}
