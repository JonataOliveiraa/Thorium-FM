import { Terraria, Microsoft, Modules } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';

const { Color, Vector2, Effects, Rand, TileData } = Modules;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const { ItemDropRule, Conditions } = Terraria.GameContent.ItemDropRules;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;

const GetLight = Terraria.Lighting['Color GetColor(int x, int y)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
const DRAW_SIG = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const STATE_IDLE = 0;
const STATE_FLYING = 1;
const STATE_START_CHARGE = 2;
const STATE_CHARGING = 3;
const STATE_SPINNING = 4;

const TRAIL = 15;
const HALF_PI = Math.PI / 2;
const TWO_PI = Math.PI * 2;

const DUST_SMOKE = 31;
const DUST_SECONDARY = 12;
const GORE_TYPE = 61;

const DROP_MATERIAL = 188;
const DROP_ACCESSORY = 49;
const DROP_HARDMODE = 535;

export class LifeCrystalMimic extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/Cavern/' + this.constructor.name;
        this.TrailFrames = [];
        this.Tile = new TileData(0, 0);
        this.Roar = null;
    }

    static WrapAngle(angle) {
        angle %= TWO_PI;
        if (angle <= -Math.PI) angle += TWO_PI;
        else if (angle > Math.PI) angle -= TWO_PI;
        return angle;
    }

    // maxChange negativo gira NO SENTIDO OPOSTO ao alvo (usado no ricochete)
    static AngleTowards(current, target, maxChange) {
        const wrap = LifeCrystalMimic.WrapAngle;
        let delta = wrap(wrap(target) - wrap(current));
        if (delta > 0) delta = Math.min(delta, maxChange);
        else if (delta < 0) delta = Math.max(delta, -maxChange);
        return wrap(current + delta);
    }

    static Condition(name) {
        const type = Conditions[name];
        return type ? type.new() : null;
    }

    TileAt(x, y) {
        this.Tile.Initialize(x, y);
        return this.Tile;
    }

    Trail(whoAmI) {
        let buffer = this.TrailFrames[whoAmI];
        if (!buffer) {
            buffer = new Int32Array(TRAIL);
            this.TrailFrames[whoAmI] = buffer;
        }
        return buffer;
    }

    SetStaticDefaults() {
        Terraria.Main.npcFrameCount[this.Type] = 17;
        Terraria.ID.NPCID.Sets.TrailCacheLength[this.Type] = TRAIL;
        Terraria.ID.NPCID.Sets.TrailingMode[this.Type] = 3;
        this.BestiaryRarityStars = 2;

        const SoundID = Terraria.ID.SoundID;
        this.Roar = SoundID.ForceRoar ?? SoundID.Roar ?? SoundID.NPCHit1;
    }

    SetDefaults() {
        this.NPC.width = 30;
        this.NPC.height = 30;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 8;
        this.NPC.lifeMax = 200;
        this.NPC.rarity = 2;
        this.NPC.knockBackResist = 0;
        this.NPC.HitSound = Terraria.ID.SoundID.Item27;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath6;
        this.NPC.value = ModNPC.NPCValue(0, 1, 0, 0);

        const banner = ModItem.getTypeByName('LifeCrystalMimicBanner');
        if (banner) {
            this.Banner = this.Type;
            this.BannerItem = banner;
        }
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[20] = true;
        npc.buffImmune[24] = true;
        npc.buffImmune[31] = true;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Caverns);

        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.LifeCrystalMimic');
        bestiaryEntry.Info.Add(FlavorText);
    }

    OnSpawn(npc) {
        this.Trail(npc.whoAmI).fill(0);
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || !info.Cavern) return 0;
        if (info.Water || info.PlayerSafe) return 0;

        if (!info.HardMode) {
            if (!Terraria.NPC.downedBoss3) return 0;
            if (info.Player.statLifeMax2 < 200) return 0;
        }

        const x = info.SpawnTileX;
        const y = info.SpawnTileY;
        if (x < 1 || x >= Terraria.Main.maxTilesX - 2) return 0;
        if (y < 1 || y >= Terraria.Main.maxTilesY - 2) return 0;

        // precisa de dois tiles solidos lado a lado com espaco livre em cima
        if (this.TileAt(x, y - 1).isSolidOrSloped) return 0;
        if (this.TileAt(x + 1, y - 1).isSolidOrSloped) return 0;
        if (!this.TileAt(x, y).isSolid) return 0;
        if (!this.TileAt(x + 1, y).isSolid) return 0;

        return 0.008;
    }

    AI(npc) {
        if (npc.ai[0] === STATE_IDLE) {
            this.AI_Idle(npc);
            return;
        }

        let player = Terraria.Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player.active || player.dead) {
            npc.TargetClosest(true);
            player = Terraria.Main.player[npc.target];
            npc.netUpdate = true;
        }

        npc.noGravity = true;
        npc.noTileCollide = true;
        npc.damage = npc.defDamage;
        npc.defense = npc.defDefense;
        npc.takenDamageMultiplier = 1;

        const center = npc.Center;
        Effects.AddLight(center, 0.4, 0.15, 0.05);

        const target = player.Center;
        const dx = target.X - center.X;
        const dy = target.Y - center.Y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 0.0001;
        const angle = Math.atan2(dy, dx);

        switch (npc.ai[0]) {
            case STATE_FLYING:
                this.AI_Flying(npc, player, dx, dy, dist, angle);
                break;
            case STATE_START_CHARGE:
                this.AI_StartCharge(npc, center, dx, dy, dist);
                break;
            case STATE_CHARGING:
                this.AI_Charging(npc, angle);
                break;
            case STATE_SPINNING:
                this.AI_Spinning(npc, player, angle);
                break;
        }
    }

    // Disfarcado de Life Crystal: so acorda se o player chegar perto ou levar dano
    AI_Idle(npc) {
        if (npc.ai[3] === 0) {
            const pos = npc.position;
            pos.X += 8;
            npc.position = pos;
            npc.ai[3] = 1;
        }

        npc.TargetClosest(true);

        const vel = npc.velocity;
        if (Math.abs(vel.X) > 2 || Math.abs(vel.Y) > 4) {
            npc.ai[0] = STATE_FLYING;
            npc.netUpdate = true;
            return;
        }

        const hurt = npc.life < npc.lifeMax;

        if (!hurt) {
            const player = Terraria.Main.player[npc.target];
            const npos = npc.position;
            const ppos = player.position;
            const left = npos.X - 100;
            const top = npos.Y - 100;

            if (ppos.X + player.width <= left) return;
            if (ppos.X >= left + npc.width + 200) return;
            if (ppos.Y + player.height <= top) return;
            if (ppos.Y >= top + npc.height + 200) return;
        }

        npc.ai[0] = STATE_SPINNING;
        npc.ai[1] = -10;
        npc.netUpdate = true;

        vel.Y -= hurt ? 6 : 3;
        npc.velocity = vel;
    }

    AI_Flying(npc, player, dx, dy, dist, angle) {
        let timer = npc.ai[1] + 1;

        if (timer > 400) {
            npc.TargetClosest(true);
            npc.ai[0] = STATE_START_CHARGE;
            npc.ai[1] = 0;
            npc.ai[2] = 0;
            npc.ai[3] = 1;
            npc.netUpdate = true;
            return;
        }

        npc.ai[1] = timer;

        let speed = 1.5;
        let accel = 0.04;
        const vel = npc.velocity;

        // vaivem quando esta colado no player
        if (dist < 250) {
            let wobble = npc.ai[2] + 0.9;
            vel.Y += wobble > 0 ? 0.04 : -0.04;
            vel.X += Math.abs(wobble) > 100 ? 0.04 : -0.04;
            if (wobble > 200) wobble = -200;
            npc.ai[2] = wobble;
        }

        if (dist > 350) { speed = 6; accel = 0.35; }
        else if (dist > 300) { speed = 3.5; accel = 0.25; }
        else if (dist > 250) { speed = 2; accel = 0.125; }

        const scale = speed / dist;
        let goalX = dx * scale;
        let goalY = dy * scale;

        if (player.dead) {
            npc.ai[1] = 0;
            goalX = npc.direction * speed / 2;
            goalY = -speed / 2;
        }

        if (vel.X < goalX) vel.X += accel;
        else if (vel.X > goalX) vel.X -= accel;

        if (vel.Y < goalY) vel.Y += accel;
        else if (vel.Y > goalY) vel.Y -= accel;

        npc.velocity = vel;
        npc.rotation = LifeCrystalMimic.AngleTowards(npc.rotation, angle - HALF_PI, 0.08);
    }

    AI_StartCharge(npc, center, dx, dy, dist) {
        Effects.PlaySound(this.Roar, center.X, center.Y, 1, 0.4, 0.2);

        const scale = (npc.life < npc.lifeMax * 0.5 ? 14 : 10) / dist;
        const vel = npc.velocity;
        vel.X = dx * scale;
        vel.Y = dy * scale;
        npc.velocity = vel;

        npc.rotation = Math.atan2(vel.Y, vel.X) - HALF_PI;
        npc.ai[0] = STATE_CHARGING;
        npc.netUpdate = true;
    }

    AI_Charging(npc, angle) {
        let timer = npc.ai[1];
        let charges = npc.ai[2];
        const stage = npc.ai[3];

        // enfurecido: bate mais forte, defende menos e toma mais dano
        if (stage >= 3) {
            npc.damage = npc.defDamage + ((npc.defDamage / 2) | 0);
            npc.defense = (npc.defDefense / 2) | 0;
            npc.takenDamageMultiplier = 1.5;
        }

        timer++;
        const vel = npc.velocity;

        if (timer >= 15) {
            vel.X *= 0.975;
            vel.Y *= 0.975;
            if (vel.X > -0.1 && vel.X < 0.1) vel.X = 0;
            if (vel.Y > -0.1 && vel.Y < 0.1) vel.Y = 0;
        }

        // ricochete: ao ser atingido no meio da investida, desvia 45 graus PRA LONGE
        if (npc.justHit && timer >= 10 && timer < 50 && (stage === 1 || stage === 3)) {
            const length = Math.sqrt(vel.X * vel.X + vel.Y * vel.Y);
            const newAngle = LifeCrystalMimic.AngleTowards(npc.rotation + HALF_PI, angle, -Math.PI / 4);
            vel.X = Math.cos(newAngle) * length;
            vel.Y = Math.sin(newAngle) * length;
            npc.ai[3] = stage + 1;
            charges = 2;
            npc.netUpdate = true;
        }

        npc.velocity = vel;

        if (timer >= 60) {
            charges++;
            timer = 0;
            npc.TargetClosest(true);

            if (charges >= 3) {
                npc.ai[0] = Rand.NextBool() ? STATE_FLYING : STATE_SPINNING;
                charges = 0;
                npc.netUpdate = true;
            } else {
                npc.ai[0] = STATE_START_CHARGE;
            }
        } else {
            npc.rotation = Math.atan2(vel.Y, vel.X) - HALF_PI;
        }

        npc.ai[1] = timer;
        npc.ai[2] = charges;
    }

    AI_Spinning(npc, player, angle) {
        const vel = npc.velocity;
        vel.X *= 0.96;
        vel.Y *= 0.96;
        if (vel.X > -0.1 && vel.X < 0.1) vel.X = 0;
        if (vel.Y > -0.1 && vel.Y < 0.1) vel.Y = 0;
        npc.velocity = vel;

        const timer = npc.ai[1] + 1;
        npc.rotation = LifeCrystalMimic.AngleTowards(npc.rotation, angle - HALF_PI, 0.08);

        if (timer < 160) {
            npc.ai[1] = timer;
            return;
        }

        npc.ai[1] = 0;
        npc.ai[3] = 3;
        npc.TargetClosest(true);
        npc.ai[0] = player.dead ? STATE_FLYING : STATE_START_CHARGE;
        npc.netUpdate = true;
    }

    FindFrame(npc, frameHeight) {
        const frame = npc.frame;
        const state = npc.ai[0];
        const timer = npc.ai[1];
        const stage = npc.ai[3];
        const index = (frame.Y / frameHeight) | 0;

        // frames 0-10 = normal, 11-16 = enfurecido. O segundo conjunto e
        // exatamente o complemento do primeiro, entao um flag basta.
        const calm = state <= STATE_FLYING || (state <= STATE_CHARGING && stage <= 2);
        let counter = npc.frameCounter + 1;

        if (calm || index < 11) {
            if (state === STATE_FLYING) counter += timer / 160;
            else if (state === STATE_CHARGING) counter += 2 * Math.min((55 - timer) * 0.03, 1);

            if (counter > 5) {
                counter = 0;
                frame.Y += frameHeight;
                if (((frame.Y / frameHeight) | 0) > 10) frame.Y = calm ? 0 : 11 * frameHeight;
            }
        } else {
            if (state === STATE_SPINNING) counter += Math.min(0.02 * timer, 2);
            else if (state === STATE_CHARGING) counter += 2 * Math.min((55 - timer) * 0.03, 1);

            if (counter > 5) {
                counter = 0;
                frame.Y += frameHeight;
                if (((frame.Y / frameHeight) | 0) > 16) frame.Y = 11 * frameHeight;
            }
        }

        npc.frameCounter = counter;
        npc.frame = frame;

        const buffer = this.Trail(npc.whoAmI);
        for (let i = TRAIL - 1; i > 0; i--) buffer[i] = buffer[i - 1];
        buffer[0] = frame.Y;
    }

    PreDraw(npc, spriteBatch, screenPos) {
        if (npc.ai[0] === STATE_IDLE) return true;

        const asset = Terraria.GameContent.TextureAssets.Npc[this.Type];
        if (!asset || !asset.IsLoaded) return true;

        const texture = asset.Value;
        const frame = npc.frame;
        const scale = npc.scale;
        const origin = Vector2.new(frame.Width / 2, frame.Height / 2);

        const position = npc.position;
        const posX = position.X;
        const posY = position.Y;
        const offsetX = npc.width / 2 - screenPos.X;
        const offsetY = npc.height - (frame.Height * scale) / 2 + 4 + npc.gfxOffY - screenPos.Y;

        const center = npc.Center;
        const light = GetLight((center.X / 16) | 0, (center.Y / 16) | 0);
        const drawColor = npc.GetNPCColorTintedByBuffs(npc.GetAlpha(light));

        const effects = npc.spriteDirection === 1
            ? SpriteEffects.FlipHorizontally
            : SpriteEffects.None;

        const Draw = spriteBatch[DRAW_SIG];
        const buffer = this.Trail(npc.whoAmI);
        const oldPos = npc.oldPos;
        const oldRot = npc.oldRot;
        const length = oldPos.length;
        const fade = 0.3 / length;

        for (let i = length - 1; i > 0; i--) {
            const old = oldPos[i];
            if (old.X === posX && old.Y === posY) continue;

            frame.Y = buffer[i];

            Draw(
                texture,
                Vector2.new(old.X + offsetX, old.Y + offsetY),
                frame,
                Color.op_Multiply(drawColor, 0.3 - i * fade),
                oldRot[i],
                origin,
                scale,
                effects,
                0
            );
        }

        return true;
    }

    HitEffect(npc, hitDirection, damage) {
        const position = npc.position;
        const width = npc.width;
        const height = npc.height;
        const dust = Terraria.Main.dust;

        if (npc.life > 0) {
            const count = (damage / npc.lifeMax) * 30;
            for (let i = 0; i < count; i++) {
                dust[NewDust(position, width, height, DUST_SMOKE, 0, 0, 0, Color.new(0, 0, 0, 0), 1)].noGravity = true;
                dust[NewDust(position, width, height, DUST_SECONDARY, 0, 0, 0, Color.new(0, 0, 0, 0), 1)].noGravity = true;
            }
            return;
        }

        for (let i = 0; i < 10; i++) {
            const a = dust[NewDust(position, width, height, DUST_SMOKE, 0, 0, 0, Color.new(0, 0, 0, 0), 1.5)];
            a.velocity = Vector2.Multiply(a.velocity, 2);
            a.noGravity = true;

            const b = dust[NewDust(position, width, height, DUST_SECONDARY, 0, 0, 0, Color.new(0, 0, 0, 0), 1)];
            b.velocity = Vector2.Multiply(b.velocity, 2);
            b.noGravity = true;
        }

        const gorePos = Vector2.new(position.X, npc.Center.Y - 10);
        for (let i = 0; i < 3; i++) {
            NewGore(
                gorePos,
                Vector2.new(Rand.Next(-2, 3) * 0.5, Rand.Next(-2, 3) * 0.5),
                GORE_TYPE,
                npc.scale
            );
        }
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(DROP_MATERIAL, 1, 2, 4));

        const lifeQuartz = ModItem.getTypeByName('LifeQuartz');
        if (!lifeQuartz) return;

        const notExpert = LifeCrystalMimic.Condition('NotExpert');
        const isExpert = LifeCrystalMimic.Condition('IsExpert');

        if (notExpert && isExpert) {
            npcLoot.Add(ItemDropRule.ByCondition(notExpert, lifeQuartz, 1, 8, 16, 1));
            npcLoot.Add(ItemDropRule.ByCondition(isExpert, lifeQuartz, 1, 16, 32, 1));
        } else {
            npcLoot.Add(ItemDropRule.Common(lifeQuartz, 1, 8, 16));
        }
    }

    // Um acessorio por morte. Feito na mao porque o pool muda com o hardmode
    // e nao existe condicao "NotHardmode" no vanilla.
    OnKill(npc) {
        const pool = [DROP_ACCESSORY];

        const lifeGem = ModItem.getTypeByName('LifeGem');
        if (lifeGem) pool.push(lifeGem);
        if (Terraria.Main.hardMode) pool.push(DROP_HARDMODE);

        NewItem(
            npc.position.X | 0,
            npc.position.Y | 0,
            npc.width,
            npc.height,
            pool[Rand.Next(pool.length)],
            1, false, 0, false
        );
    }
}