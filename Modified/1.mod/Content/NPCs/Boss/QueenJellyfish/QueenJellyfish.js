import { Terraria, Microsoft, Modules } from '../../../../TL/ModImports.js';
import { ModNPC } from '../../../../TL/ModNPC.js';
import { ModProjectile } from '../../../../TL/ModProjectile.js';
import { WorldDB } from '../../../../TL/WorldDB.js';
import { ProjAI } from '../../../../TL/ProjAI.js';

const { Color, Vector2 } = Modules;
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];
const NewNPC = Terraria.NPC['int NewNPC(IEntitySource source, int X, int Y, int Type, int Start, float ai0, float ai1, float ai2, float ai3, int Target)'];
const GetSource_ForNPC = 'IEntitySource GetSpawnSourceForNPCFromNPCAI()';
const CountNPCS = Terraria.NPC['int CountNPCS(int Type)'];

// Cached type IDs — initialized once after mod registration
let _zealousType = -1, _spittingType = -1, _distractingType = -1;
let _bubblePulseType = -1, _armType = -1, _bubbleBombType = -1, _torrentType = -1;
let _typesInit = false;
function initTypes() {
    if (_typesInit) return;
    _typesInit = true;
    _zealousType     = ModNPC.getTypeByName('ZealousJellyfish');
    _spittingType    = ModNPC.getTypeByName('SpittingJellyfish');
    _distractingType = ModNPC.getTypeByName('DistractingJellyfish');
    _bubblePulseType = ModProjectile.getTypeByName('BubblePulse');
    _bubbleBombType  = ModProjectile.getTypeByName('BubbleBomb');
    _torrentType     = ModProjectile.getTypeByName('QueenTorrent');
    _armType         = ModProjectile.getTypeByName('QueenJellyfishArm');
}

// =============================================================================
// VISUAL TUNING — adjust these values to align the overlays with the boss body.
// All values are in pixels. Negative Y = up, positive Y = down.
// =============================================================================

// Effect (crown) base offset from the queen's center.
// Make MORE NEGATIVE to raise the crown higher above the boss.
const EFFECT_Y_OFFSET = -75;

// Diver base offset from the queen's center.
// Negative = pull diver UP into the bell.
const DIVER_Y_OFFSET = -32;

// Per-frame Y nudge for the EFFECT (crown) — index = boss frame (0..7).
// Positive values pull the crown DOWN to follow the body contraction.
// Frames 0-3: idle. Frames 4,7: half-contracted. Frames 5,6: most contracted.
const EFFECT_FRAME_NUDGE = [0, 0, 0, 0, 8, 20, 20, 8];

// Per-frame Y nudge for the DIVER — same indexing.
// Positive values pull the diver DOWN with the contracting body.
const DIVER_FRAME_NUDGE  = [0, 0, 0, 0, 5, 10, 10, 5];

export class QueenJellyfish extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Boss/QueenJellyfish/' + this.constructor.name;
        this.counter = 0;
        this.diverOffset = 0;
        this._effectTex = null;
        this._diverTex  = null;
        this._texLoaded = false;
        this._logTimer  = 0;
        // Effect animation
        this._effectFrame = 0;
        this._effectFrameTimer = 0;
    }

    _loadTextures() {
        if (this._texLoaded) return;
        this._texLoaded = true;
        try { this._effectTex = tl.texture.load('Textures/NPCs/Boss/QueenJellyfish/QueenJellyfish_Effect.png'); } catch (_) {}
        try { this._diverTex  = tl.texture.load('Textures/NPCs/Boss/QueenJellyfish/QueenJellyfish_Diver.png');  } catch (_) {}
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 8;
        Terraria.ID.NPCID.Sets.MPAllowedEnemies[this.Type] = true;
        Terraria.ID.NPCID.Sets.BossBestiaryPriority.Add(this.Type);
        this.BestiaryRarityStars = 3;
        this.Music = Terraria.ID.MusicID.Boss2;
    }

    SetDefaults() {
        this.NPC.width = 80;
        this.NPC.height = 80;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 22;
        this.NPC.defense = 6;
        this.NPC.lifeMax = 4000;
        this.NPC.knockBackResist = 0.0;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.boss = true;
        this.NPC.npcSlots = 20;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath19;
        this.NPC.value = ModNPC.NPCValue(0, 0, 0, 1);
    }

    PreAI(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        return true;
    }

    // ModifyNPCLoot(npcLoot) { /* uncomment when items are ready */ }

    AI(npc) {
        initTypes();

        // Target
        let player = Terraria.Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || player.dead || !player.active) {
            npc.TargetClosest(true);
            player = Terraria.Main.player[npc.target];
        }

        // Despawn when player is dead
        if (player.dead) {
            let vel = npc.velocity;
            vel.Y -= 0.4;
            npc.velocity = vel;
            npc.EncourageDespawn(10);
            return;
        }

        const lifeRatio = npc.life / npc.lifeMax;
        const isServer  = Terraria.Main.netMode !== 1;

        // Speed scales with damage taken
        const moveSpeed = lifeRatio > 0.6 ? 3 : lifeRatio > 0.3 ? 4 : 5;

        // --- Minion Spawning (server only) ---
        if (isServer) {
            // ai[0] = zealous timer
            npc.ai[0]++;
            if (npc.ai[0] >= 120) {
                if (CountNPCS(_zealousType) < 3) {
                    npc.ai[0] = 0;
                    NewNPC(npc[GetSource_ForNPC](), npc.Center.X | 0, npc.Center.Y | 0, _zealousType, 0, 0, 0, 0, 0, npc.target);
                } else {
                    npc.ai[0] = 60;
                }
            }

            // ai[1] = spitting timer (phase 2: < 70% HP)
            if (lifeRatio < 0.7) {
                npc.ai[1]++;
                if (npc.ai[1] >= 180) {
                    if (CountNPCS(_spittingType) < 2) {
                        npc.ai[1] = 0;
                        NewNPC(npc[GetSource_ForNPC](), npc.Center.X | 0, npc.Center.Y | 0, _spittingType, 0, 0, 0, 0, 0, npc.target);
                    } else {
                        npc.ai[1] = 90;
                    }
                }
            }

            // ai[2] = distracting timer (phase 3: < 40% HP)
            if (lifeRatio < 0.4) {
                npc.ai[2]++;
                if (npc.ai[2] >= 240) {
                    if (CountNPCS(_distractingType) < 2) {
                        npc.ai[2] = 0;
                        NewNPC(npc[GetSource_ForNPC](), npc.Center.X | 0, npc.Center.Y | 0, _distractingType, 0, npc.whoAmI, 0, 0, 0, npc.target);
                    } else {
                        npc.ai[2] = 120;
                    }
                }
            }
        }

        // --- Spawn 4 tentacle arms once when HP drops below 50% ---
        // Use post-spawn assignment for ai params (more reliable than passing through NewProjectile).
        if (isServer && lifeRatio < 0.5 && npc.localAI[0] < 1 && _armType >= 0) {
            npc.localAI[0] = 1;
            for (let i = 0; i < 4; i++) {
                const idx = NewProjectile(
                    npc.GetSpawnSource_ForProjectile(),
                    npc.Center.X, npc.Center.Y,
                    0, 0,
                    _armType, Math.max(20, npc.damage), 0, 255,
                    0, 0, 0, null
                );
                if (idx >= 0 && idx < Terraria.Main.maxProjectiles) {
                    const armProj = Terraria.Main.projectile[idx];
                    const armAI = new ProjAI(armProj, false);
                    armAI[0] = npc.whoAmI;  // boss whoAmI
                    armAI[1] = i;            // arm index 0..3
                }
            }
        }

        // --- Attack 1: single BubblePulse aimed at player (every 120 ticks) ---
        // localAI[1] = attack timer 1
        if (isServer && _bubblePulseType >= 0) {
            npc.localAI[1]++;
            if (npc.localAI[1] >= 120) {
                npc.localAI[1] = 0;
                const dx1 = player.Center.X - npc.Center.X;
                const dy1 = player.Center.Y - npc.Center.Y;
                const d1  = Math.sqrt(dx1 * dx1 + dy1 * dy1) || 1;
                NewProjectile(Terraria.Projectile.GetNoneSource(), npc.Center.X, npc.Center.Y, (dx1 / d1) * 7, (dy1 / d1) * 7, _bubblePulseType, npc.damage, 3, 255, 0, 0, 0, null);
            }

            // --- Attack 2: 3-way spread (only below 50% HP, every 180 ticks) ---
            if (lifeRatio < 0.5) {
                npc.localAI[2]++;
                if (npc.localAI[2] >= 180) {
                    npc.localAI[2] = 0;
                    const dx2  = player.Center.X - npc.Center.X;
                    const dy2  = player.Center.Y - npc.Center.Y;
                    const d2   = Math.sqrt(dx2 * dx2 + dy2 * dy2) || 1;
                    const baseAngle = Math.atan2(dy2, dx2);
                    for (let i = -1; i <= 1; i++) {
                        const a = baseAngle + i * 0.35;
                        NewProjectile(Terraria.Projectile.GetNoneSource(), npc.Center.X, npc.Center.Y, Math.cos(a) * 6, Math.sin(a) * 6, _bubblePulseType, npc.damage, 2, 255, 0, 0, 0, null);
                    }
                }
            }
        }

        // --- Attack 3: BubbleBomb dropped above the player (random 7-10s, < 70% HP) ---
        // npc.ai[3] used as a countdown timer.
        if (isServer && _bubbleBombType >= 0 && lifeRatio < 0.7) {
            if (npc.ai[3] <= 0) {
                npc.ai[3] = 420 + Math.floor(Math.random() * 180); // 420..600 ticks (7-10s)
                const spawnX = player.Center.X + (Math.random() * 100 - 50);
                const spawnY = player.Center.Y - 320;
                NewProjectile(
                    npc.GetSpawnSource_ForProjectile(),
                    spawnX, spawnY,
                    (player.Center.X - spawnX) * 0.01, 2,
                    _bubbleBombType, Math.max(18, (npc.damage * 0.8) | 0), 3, 255,
                    0, 0, 0, null
                );
            } else {
                npc.ai[3]--;
            }
        }

        // --- Attack 4: QueenTorrent column on the player's ground (< 30% HP, every ~25s) ---
        // 7 torrents stacked vertically from the ground up. Each lasts 7 seconds, deals 150 damage,
        // and pulls nearby players. localAI[3] = countdown timer.
        if (isServer && _torrentType >= 0 && lifeRatio < 0.3) {
            if (npc.localAI[3] <= 0) {
                npc.localAI[3] = 1500;
                const groundY = player.Bottom.Y;
                const spawnX  = player.Center.X;
                for (let i = 0; i < 7; i++) {
                    NewProjectile(
                        npc.GetSpawnSource_ForProjectile(),
                        spawnX, groundY - i * 35,
                        0, 0,
                        _torrentType, 150, 0, 255,
                        0, 0, 0, null
                    );
                }
            } else {
                npc.localAI[3]--;
            }
        }

        // --- Movement: hover 225px above player ---
        const dx  = player.Center.X - npc.Center.X;
        const dy  = (player.Center.Y - 225) - npc.Center.Y;
        const distSq = dx * dx + dy * dy;

        if (distSq > 400) {
            const dist = Math.sqrt(distSq);
            let vel = npc.velocity;
            vel.X += (dx / dist) * 0.2;
            vel.Y += (dy / dist) * 0.2;

            const speedSq = vel.X * vel.X + vel.Y * vel.Y;
            if (speedSq > moveSpeed * moveSpeed) {
                const inv = moveSpeed / Math.sqrt(speedSq);
                vel.X *= inv;
                vel.Y *= inv;
            }
            npc.velocity = vel;
        }

        npc.spriteDirection = dx > 0 ? 1 : -1;
    }

    FindFrame(npc, frameHeight) {
        const frame = npc.frame;
        this.counter++;
        if (this.counter >= 6) {
            this.counter = 0;
            frame.Y = ((frame.Y / frameHeight | 0) + 1) % 8 * frameHeight;
        }
        npc.frame = frame;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        this._loadTextures();
        if (!this._diverTex || WorldDB.get('QueenJellyfish:Downed')) return true;

        this.diverOffset = Math.sin(Date.now() / 600) * 4;

        // Frame-based Y nudge so the diver follows the body contraction
        const fh = npc.frame.Height || 1;
        const bossFrameIdx = Math.min((npc.frame.Y / fh) | 0, 7);
        const diverNudge = DIVER_FRAME_NUDGE[bossFrameIdx] ?? 0;

        spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
            this._diverTex,
            Vector2.new(
                npc.Center.X - screenPos.X,
                npc.Center.Y - screenPos.Y + DIVER_Y_OFFSET + diverNudge + this.diverOffset
            ),
            null, Color.White, 0,
            Vector2.new(this._diverTex.Width / 2, this._diverTex.Height / 2),
            1.0, Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
        );
        return true;
    }

    PostDraw(npc, spriteBatch, screenPos, drawColor) {
        this._loadTextures();
        if (!this._effectTex) return;

        // Animate effect texture (assumes same frame count as boss: 8 frames stacked vertically)
        const EFFECT_FRAMES = 8;
        this._effectFrameTimer++;
        if (this._effectFrameTimer >= 5) {
            this._effectFrameTimer = 0;
            this._effectFrame = (this._effectFrame + 1) % EFFECT_FRAMES;
        }

        // Per-frame nudge tracks body contraction — table defined at top of file
        const bossFrameH = npc.frame.Height || 1;
        const bossFrameIdx = Math.min((npc.frame.Y / bossFrameH) | 0, 7);
        const nudge = EFFECT_FRAME_NUDGE[bossFrameIdx] ?? 0;

        const drawX = npc.Center.X - screenPos.X;
        const drawY = npc.Center.Y - screenPos.Y + EFFECT_Y_OFFSET + nudge;

        // Source rectangle to show only the current effect frame
        const effectFrameH = Math.floor(this._effectTex.Height / EFFECT_FRAMES);
        let srcRect = null;
        try {
            srcRect = Microsoft.Xna.Framework.Rectangle.new(
                0, this._effectFrame * effectFrameH,
                this._effectTex.Width, effectFrameH
            );
        } catch (_) {}

        // Log draw position every 5 seconds to help tune EFFECT_Y_OFFSET
        this._logTimer++;
        if (this._logTimer >= 300) {
            this._logTimer = 0;
        }

        const originH = srcRect ? effectFrameH : this._effectTex.Height;
        spriteBatch['void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)'](
            this._effectTex,
            Vector2.new(drawX, drawY),
            srcRect, Color.White, 0,
            Vector2.new(this._effectTex.Width / 2, originH / 2),
            1.0, Microsoft.Xna.Framework.Graphics.SpriteEffects.None, 0
        );
    }

    OnKill(npc) {
        WorldDB.set('QueenJellyfish:Downed', true);
    }
}
