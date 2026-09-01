import { Terraria, Microsoft, Modules } from './../../../TL/ModImports.js';
import { ModBuff } from './../../../TL/ModBuff.js';
import { ModProjectile } from './../../../TL/ModProjectile.js';
import { ProjAI } from './../../../TL/ProjAI.js';
import { ThoriumPlayer } from './../../Global/ThoriumPlayer.js';

const { Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const ENTITY_DRAW = 'void EntitySpriteDraw(Texture2D texture, Vector2 position, Rectangle sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float worthless)';

const MAX_PROJ = Terraria.Main.maxProjectiles ?? 1000;
const _bob = new Int16Array(MAX_PROJ);
const _pointX = new Float32Array(MAX_PROJ);
const _pointY = new Float32Array(MAX_PROJ);
const _dead = new Uint8Array(MAX_PROJ);
const _wasInCombat = new Uint8Array(MAX_PROJ);

const IDLE = 0, POINTING = 1, SURFER = 2, PATTING = 3, SLAIN_BOSS = 4, PLAYER_DEAD = 5;

function angleLerp(from, to, amount) {
    let diff = to - from;
    while (diff > Math.PI) diff -= Math.PI * 2;
    while (diff < -Math.PI) diff += Math.PI * 2;
    return from + diff * amount;
}

export class SuspiciousMoisturizerBottlePro extends ModProjectile {
    static BOB_MAX = 150;
    static BOB_ROT_OFFSET = 0.3;
    static HOVER_Y = -64;
    static PAT_Y = -32;
    static SEARCH_SQ = 1440000;
    static DEAD_TIME = 240;
    static BOSS_TIME = 600;
    static PAT_TIME = 180;

    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
        this.buffType = 0;
    }

    SetStaticDefaults() {
        Main.projFrames[this.Type] = 11;
        Main.projPet[this.Type] = true;
    }

    SetDefaults() {
        this.CloneDefaults(380);
        this.Projectile.tileCollide = false;
        this.Projectile.width = 38;
        this.Projectile.height = 38;
        this.Projectile.aiStyle = -1;
    }

    OnSpawn(proj) {
        const slot = proj.whoAmI;
        _bob[slot] = 0;
        _pointX[slot] = 0;
        _pointY[slot] = 0;
        _dead[slot] = 0;
        _wasInCombat[slot] = 0;
        const ai = new ProjAI(proj, false);
        ai[0] = IDLE;
        ai[1] = 0;
    }

    AI(proj) {
        if (!this.buffType) this.buffType = ModBuff.getTypeByName('SuspiciousMoisturizerBottleBuff');

        const player = Main.player[proj.owner];
        const slot = proj.whoAmI;
        const ai = new ProjAI(proj, false);

        if (player.dead && _dead[slot] === 1 && ai[0] !== PLAYER_DEAD) {
            proj.Kill();
            return;
        }
        if (!player.dead) _dead[slot] = 0;
        if (!player.dead && player.FindBuffIndex(this.buffType) >= 0) proj.timeLeft = 2;

        _bob[slot]++;
        if (_bob[slot] >= SuspiciousMoisturizerBottlePro.BOB_MAX) _bob[slot] = 0;

        this.HandleCooldown(proj, player, slot, ai);
        this.StateAI(proj, player, slot, ai);

        proj.gfxOffY = player.gfxOffY;
        _wasInCombat[slot] = ThoriumPlayer.InCombat ? 1 : 0;
    }

    BobRotation(slot) {
        const factor = (_bob[slot] / SuspiciousMoisturizerBottlePro.BOB_MAX
            + SuspiciousMoisturizerBottlePro.BOB_ROT_OFFSET) % 1;
        return Math.sin(factor * Math.PI * 2) * 0.08;
    }

    BobOffsetY(slot) {
        return Math.sin((_bob[slot] / SuspiciousMoisturizerBottlePro.BOB_MAX) * Math.PI * 2) * 6;
    }

    StateAI(proj, player, slot, ai) {
        let applyBobRotation = true;
        let facePlayer = true;
        let hoverAbove = true;

        proj.hide = false;

        switch (ai[0]) {
            case POINTING: {
                proj.frame = 7;
                if (_pointX[slot] === 0 && _pointY[slot] === 0) return;
                const dx = _pointX[slot] - proj.Center.X;
                const dy = _pointY[slot] - proj.Center.Y;
                let target = Math.atan2(dy, dx) - Math.PI;
                proj.spriteDirection = dx < 0 ? -1 : 1;
                if (proj.spriteDirection === -1) target += Math.PI;
                proj.rotation = angleLerp(proj.rotation, target, 0.1);
                applyBobRotation = false;
                facePlayer = false;
                break;
            }
            case SURFER:
                proj.frame = 9;
                break;
            case PATTING: {
                proj.frame = 8;
                const offX = (10 + proj.width / 2) * -player.direction;
                proj.Center = Vector2.new(
                    player.Center.X + offX,
                    player.Center.Y + SuspiciousMoisturizerBottlePro.PAT_Y
                );
                const cycle = 1 - (ai[1] / 36) % 1;
                proj.rotation = 0.15 * proj.spriteDirection + Math.cos(cycle * Math.PI * 2) * 0.15;
                proj.hide = true;
                applyBobRotation = false;
                hoverAbove = false;
                _bob[slot] = 0;
                break;
            }
            case SLAIN_BOSS:
                proj.frame = 5;
                break;
            case PLAYER_DEAD:
                proj.frame = 6;
                break;
            default:
                proj.frameCounter++;
                if (proj.frameCounter >= 8) {
                    proj.frame++;
                    proj.frameCounter = 0;
                }
                if (proj.frame > 4) proj.frame = 0;
                break;
        }

        if (applyBobRotation) proj.rotation = this.BobRotation(slot);
        if (facePlayer) {
            proj.spriteDirection = -player.direction;
            proj.direction = proj.spriteDirection;
        }
        if (hoverAbove) {
            proj.Center = Vector2.new(
                player.Center.X,
                player.Center.Y + SuspiciousMoisturizerBottlePro.HOVER_Y
            );
        }
    }

    HandleCooldown(proj, player, slot, ai) {
        if (ai[1] > 0) {
            ai[1] = ai[1] - 1;
            if (ai[1] === 0) ai[0] = IDLE;
            return;
        }
        this.HandleTriggers(proj, player, slot, ai);
    }

    HandleTriggers(proj, player, slot, ai) {
        if (_dead[slot] === 1 && ai[0] === PLAYER_DEAD) return;

        if (player.dead && _dead[slot] === 0) {
            _dead[slot] = 1;
            ai[1] = SuspiciousMoisturizerBottlePro.DEAD_TIME;
            ai[0] = PLAYER_DEAD;
            return;
        }

        if (ThoriumPlayer.BossKillTimer > 0) {
            ai[1] = SuspiciousMoisturizerBottlePro.BOSS_TIME;
            ai[0] = SLAIN_BOSS;
            return;
        }

        const outOfCombat = !ThoriumPlayer.InCombat;
        if (_wasInCombat[slot] === 1 && outOfCombat
            && player.statLife < player.statLifeMax2 * 0.2) {
            ai[1] = SuspiciousMoisturizerBottlePro.PAT_TIME;
            ai[0] = PATTING;
            return;
        }

        if (this.FindInterestingTarget(proj, slot)) {
            ai[0] = POINTING;
            return;
        }

        ai[0] = player.wet ? SURFER : IDLE;
    }

    FindInterestingTarget(proj, slot) {
        const center = proj.Center;
        const limit = SuspiciousMoisturizerBottlePro.SEARCH_SQ;

        let best = null;
        let bestDist = Infinity;

        const npcs = Main.npc;
        for (let i = 0; i < Terraria.Main.maxNPCs; i++) {
            const npc = npcs[i];
            if (!npc || !npc.active) continue;
            if (!(npc.rarity > 0 || npc.boss)) continue;
            const d = npc.DistanceSQ(center);
            if (d < limit && d < bestDist) {
                bestDist = d;
                best = npc.Center;
            }
        }

        if (best) {
            _pointX[slot] = best.X;
            _pointY[slot] = best.Y;
            return true;
        }

        const threshold = Terraria.NPC.downedPlantBoss ? 8 : (Terraria.Main.hardMode ? 5 : 2);
        const items = Main.item;
        const maxItems = Terraria.Main.maxItems ?? 400;

        bestDist = Infinity;
        for (let i = 0; i < maxItems; i++) {
            const drop = items[i];
            if (!drop || !drop.active) continue;
            if (drop.rare === -1 || Math.abs(drop.rare) < threshold) continue;
            const d = drop.DistanceSQ(center);
            if (d < limit && d < bestDist) {
                bestDist = d;
                best = drop.Center;
            }
        }

        if (!best) return false;
        _pointX[slot] = best.X;
        _pointY[slot] = best.Y;
        return true;
    }

    PreDraw(proj, lightColor) {
        const texture = Terraria.GameContent.TextureAssets.Projectile[this.Type].Value;
        if (!texture) return true;

        const slot = proj.whoAmI;
        const ai = new ProjAI(proj, false);
        const frames = Main.projFrames[this.Type];
        const frameH = (texture.Height / frames) | 0;
        const source = Rectangle.new(0, proj.frame * frameH, texture.Width, frameH);

        let originX = texture.Width * 0.5;
        if (ai[0] === PATTING) originX += proj.spriteDirection * proj.width / 2;
        const origin = Vector2.new(originX, proj.height * 0.5);

        const pos = Vector2.Subtract(
            Vector2.new(proj.Center.X, proj.Center.Y + this.BobOffsetY(slot) + proj.gfxOffY),
            Main.screenPosition
        );

        const effects = proj.spriteDirection > 0
            ? Microsoft.Xna.Framework.Graphics.SpriteEffects.None
            : Microsoft.Xna.Framework.Graphics.SpriteEffects.FlipHorizontally;

        Main[ENTITY_DRAW](texture, pos, source, lightColor, proj.rotation, origin, proj.scale, effects, 0);
        return false;
    }
}
