import { Terraria, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';
import { MiscHelper } from './../../Global/Utils/MiscHelper.js';

const { Rand, Vector2 } = Modules;
const { Main } = Terraria;

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const MAX_PROJ = Terraria.Main.maxProjectiles ?? 1000;
const _timer = new Int16Array(MAX_PROJ);
const _cooldown = new Int32Array(MAX_PROJ);
const _check = new Int16Array(MAX_PROJ);
const _dir = new Int8Array(MAX_PROJ);

export class StormCloudPro extends ModProjectile {
    static AFK_THRESHOLD = 600;
    static COOLDOWN_MAX = 900;
    static TIMER_MAX = 360;
    static CHECK_MAX = 30;
    static ROUNDS = 2.5;
    static CIRCLE_HALF_H = 6.4;
    static WIDTH_FACTOR = 10;
    static FAR_SQ = 1000000;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
        this.rainType = -1;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 4;
        Main.projPet[this.Type] = true;

        // Sem isto a tela de selecao de personagem trava ao tentar animar o pet.
        Terraria.ID.ProjectileID.Sets.CharacterPreviewAnimations[this.Type] = Terraria.ID.ProjectileID.Sets.SimpleLoop(
            0, Main.projFrames[this.Type],
            9, false
        )['SettingsForCharacterPreview WithOffset(float x, float y)'](
            -5, -20
        ).WithSpriteDirection(-1);
    }

    SetDefaults() {
        this.CloneDefaults(380);
        this.Projectile.width = 40;
        this.Projectile.height = 34;
        this.AIType = 380;
    }

    OnSpawn(proj) {
        const slot = proj.whoAmI;
        _timer[slot] = 0;
        _cooldown[slot] = StormCloudPro.COOLDOWN_MAX;
        _check[slot] = 0;
        _dir[slot] = 1;
        const ai = new ProjAI(proj, false);
        ai[0] = 0;
        ai[1] = 0;
    }

    PreAI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('StormCloudBuff');

        const player = Main.player[proj.owner];
        const slot = proj.whoAmI;
        const ai = new ProjAI(proj, false);

        if (!player.dead && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        this.CheckWatering(proj, player, slot, ai);

        if (ai[0] !== 0 || ai[1] !== 0) {
            this.DoWatering(proj, slot, ai);
            if (proj.DistanceSQ(player.Center) > StormCloudPro.FAR_SQ) {
                this.CancelWatering(slot, ai);
                proj.Center = player.Center;
            }
            this.Animate(proj);
            return false;
        }

        return true;
    }

    AI(proj) {
        const player = Main.player[proj.owner];
        proj.rotation = 0;
        proj.velocity = Vector2.Multiply(proj.velocity, 0.98);
        if (proj.DistanceSQ(player.Center) > StormCloudPro.FAR_SQ) proj.Center = player.Center;
        this.Animate(proj);
    }

    CancelWatering(slot, ai) {
        _timer[slot] = 0;
        _cooldown[slot] = StormCloudPro.COOLDOWN_MAX;
        ai[0] = 0;
        ai[1] = 0;
    }

    CheckWatering(proj, player, slot, ai) {
        if (_timer[slot] > 0) return;
        if (_cooldown[slot] > 0) {
            _cooldown[slot]--;
            return;
        }
        if (_check[slot] > 0) _check[slot]--;
        if (player.afkCounter <= StormCloudPro.AFK_THRESHOLD || _check[slot] !== 0) return;

        _check[slot] = StormCloudPro.CHECK_MAX;
        const spot = StormCloudPro.FindWateringSpot(player.position);
        if (!spot) return;

        _timer[slot] = StormCloudPro.TIMER_MAX;
        _dir[slot] = -Math.sign(spot.X - proj.Center.X) || 1;
        ai[0] = spot.X;
        ai[1] = spot.Y;
    }

    DoWatering(proj, slot, ai) {
        const baseY = StormCloudPro.CIRCLE_HALF_H;

        if (_timer[slot] === StormCloudPro.TIMER_MAX) {
            const dx = ai[0] - proj.Center.X;
            const dy = ai[1] + baseY - proj.Center.Y;
            if (dx * dx + dy * dy > 100) {
                const len = Math.sqrt(dx * dx + dy * dy) || 1;
                const vel = proj.velocity;
                proj.velocity = Vector2.new(
                    (vel.X * 5 + (dx / len) * 4) / 6,
                    (vel.Y * 5 + (dy / len) * 4) / 6
                );
                return;
            }
        }

        _timer[slot]--;
        if (_timer[slot] <= 0) {
            this.CancelWatering(slot, ai);
            return;
        }

        const progress = (StormCloudPro.TIMER_MAX - _timer[slot]) / StormCloudPro.TIMER_MAX;
        const angle = _dir[slot] * progress * StormCloudPro.ROUNDS * Math.PI * 2;
        const ox = -Math.sin(angle) * baseY * StormCloudPro.WIDTH_FACTOR;
        const oy = Math.cos(angle) * baseY;

        proj.Center = Vector2.new(ai[0] + ox, ai[1] + oy);
        proj.velocity = Vector2.Zero;

        if (_timer[slot] % 5 !== 0 || proj.wet) return;

        if (this.rainType === -1) {
            this.rainType = ModProjectile.getTypeByName('StormCloudProRain') ?? -2;
        }
        if (this.rainType < 0) return;

        const bottomLeft = proj.BottomLeft;
        const spawn = Vector2.new(
            bottomLeft.X + Rand.Next(3, proj.width - 3),
            bottomLeft.Y
        );
        NewProjectile(null, spawn, Vector2.new(0, 5), this.rainType, 0, 0, proj.owner, 0, 0, 0, null);
    }

    static FindWateringSpot(origin) {
        const ox = (origin.X / 16) | 0;
        const oy = (origin.Y / 16) | 0;
        const left = ox - 12;
        const right = ox + 14;
        const top = oy - 5;
        const bottom = oy + 8;
        const height = bottom - top;

        let fallback = null;

        for (let attempt = 0; attempt < 1000; attempt++) {
            const x = Rand.Next(left, right);
            let y = Rand.Next(top, bottom);

            if (MiscHelper.SolidTileAt(x, y)) {
                y -= Math.min(5, y - top);
                if (MiscHelper.SolidTileAt(x, y)) continue;
            }

            let headroom = true;
            let foundGround = false;
            let onGrass = false;

            for (let d = 1; d < height; d++) {
                const yy = y + d;
                if (d < 5) {
                    if (yy > bottom || MiscHelper.SolidTileAt(x, yy)) {
                        headroom = false;
                        break;
                    }
                }
                if (MiscHelper.SolidTileAt(x, yy)) {
                    foundGround = true;
                    const type = Terraria.Framing.GetTileSafely(x, yy).TileType;
                    onGrass = Terraria.ID.TileID.Sets.Grass[type]
                        || Terraria.ID.TileID.Sets.GrassSpecial[type]
                        || type === 60;
                    break;
                }
            }

            if (!foundGround || !headroom) continue;

            let clear = true;
            for (let d = 0; d < 8; d++) {
                const xx = x + d;
                if (xx > right) {
                    clear = false;
                    break;
                }
                const tile = Terraria.Framing.GetTileSafely(xx, y);
                if (MiscHelper.SolidTile(tile) || tile.LiquidAmount > 0) {
                    clear = false;
                    break;
                }
            }
            if (!clear) continue;

            const spot = Vector2.new((x + 4) * 16, y * 16);
            if (onGrass) return spot;
            if (!fallback) fallback = spot;
        }

        return fallback;
    }

    Animate(proj) {
        const max = Main.projFrames[this.Type];
        proj.frameCounter++;

        if (proj.frameCounter > 8) {
            proj.frame++;
            proj.frameCounter = 0;
        }

        if (_timer[proj.whoAmI] > 0) {
            if (proj.frame <= 2 || proj.frame >= max) proj.frame = 2;
        } else if (proj.frame >= max) {
            proj.frame = 0;
        }
    }
}
