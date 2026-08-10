import { Terraria, Modules, Microsoft } from '../../../TL/ModImports.js';
import { ModNPC } from '../../../TL/ModNPC.js';
import { ModItem } from '../../../TL/ModItem.js';
import { ModProjectile } from '../../../TL/ModProjectile.js';
import { ModLocalization } from '../../../TL/ModLocalization.js';
import { FxHelper } from '../../Global/Utils/FxHelper.js';

const { Color, Vector2, Rand } = Modules;
const { Main } = Terraria;
const { BestiaryDatabaseNPCsPopulator, FlavorTextBestiaryInfoElement } = Terraria.GameContent.Bestiary;
const { ItemDropRule } = Terraria.GameContent.ItemDropRules;
const { SpriteEffects } = Microsoft.Xna.Framework.Graphics;
const DRAW = 'void Draw(Texture2D texture, Vector2 position, Nullable`1 sourceRectangle, Color color, float rotation, Vector2 origin, float scale, SpriteEffects effects, float layerDepth)';

const CanHit = Terraria.Collision['bool CanHit(Vector2 Position1, int Width1, int Height1, Vector2 Position2, int Width2, int Height2)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, float X, float Y, float SpeedX, float SpeedY, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

const ANIM_SOURCE = 252;

const HOVER_ABOVE = 250;
const HOVER_DEADZONE = 80;
const SPEED = 3.4;
const MAX_SPEED = 4.5;
const ACCEL = 0.035;
const WOBBLE = 0.05;
const WOBBLE_STRENGTH = 1.2;
const REAIM_MIN = 80;
const REAIM_MAX = 150;
const ANGLE_JITTER = 0.25;
const OVERSHOOT = 60;         // ele passa do alvo e volta, em vez de travar em cima
const FACE_DEADZONE = 0.6;
const FACE_FLIP = -1;         // a textura dele olha pro lado contrario

const HOVER_MIN = 300;
const HOVER_MAX = 500;
const SWOOP_MIN = 120;
const SWOOP_MAX = 180;
const SWOOP_SPEED = 1.4;

const SHOT_COOLDOWN = 180;    // 3s entre raios
const SHOT_SPEED = 6;
const SHOT_DAMAGE = 20;
const MAX_DROP = 800;         // so ataca se voce estiver ate 800px abaixo
const LEAD = 10;              // quanto ele adianta a mira pela sua velocidade

let _zapType = -1;

export class WindElemental extends ModNPC {
    constructor() {
        super();
        this.Texture = 'NPCs/FloatingIslands/' + this.constructor.name;
        this._glow = null;
        this._texLoaded = false;
    }

    SetStaticDefaults() {
        Main.npcFrameCount[this.Type] = Main.npcFrameCount[ANIM_SOURCE];
    }

    SetDefaults() {
        this.NPC.width = 44;
        this.NPC.height = 44;
        this.NPC.aiStyle = -1;
        this.NPC.damage = 20;
        this.NPC.defense = 0;
        this.NPC.lifeMax = 130;
        this.NPC.knockBackResist = 0.35;
        this.NPC.alpha = 50;
        this.NPC.noGravity = true;
        this.NPC.noTileCollide = true;
        this.NPC.HitSound = Terraria.ID.SoundID.NPCHit1;
        this.NPC.DeathSound = Terraria.ID.SoundID.NPCDeath6;
        this.NPC.value = ModNPC.NPCValue(0, 0, 3, 0);

        this.AnimationType = ANIM_SOURCE;
    }

    ApplyBuffImmunity(npc) {
        npc.buffImmune[Terraria.ID.BuffID.Confused] = true;
        npc.buffImmune[70] = true; // Electrified: ele e feito de raio
    }

    SpawnChance(info) {
        if (!info.CommonEnemy || info.PlayerSafe || info.Water) return 0;
        if (!info.Sky || !Terraria.NPC.downedBoss2) return 0;
        return 0.2;
    }

    SetBestiary(database, bestiaryEntry) {
        bestiaryEntry.Info.Add(BestiaryDatabaseNPCsPopulator.CommonTags.SpawnConditions.Biomes.Sky);
        const FlavorText = FlavorTextBestiaryInfoElement.new();
        FlavorText._key = ModLocalization.Translate('Bestiary.WindElemental');
        bestiaryEntry.Info.Add(FlavorText);
    }

    /**
     * ai[0] = fase da ondulacao | ai[1] = tempo ate o raio (negativo = recarga)
     * localAI[0] = quando refazer a mira | localAI[1] = desvio de rumo
     * localAI[2] = lado pra onde ele esta passando do alvo
     * localAI[3] = ciclo pairar/mergulhar
     *
     * O C# depende da BatAI da vanilla pro movimento e so ajusta a altura por
     * cima. Como a BatAI nativa e bugada no TL, o voo e todo daqui: ele
     * derrapa ate ficar por cima de voce, passa um pouco do ponto e volta,
     * entao acaba cruzando a sua vertical de tempos em tempos e solta o raio.
     */
    AI(npc) {
        let player = Main.player[npc.target];
        if (npc.target < 0 || npc.target === 255 || !player || !player.active || player.dead) {
            npc.TargetClosest(true);
            player = Main.player[npc.target];
        }
        if (!player || !player.active || player.dead) return;

        const center = npc.Center;
        const playerCenter = player.Center;

        // Alterna entre pairar la em cima e descer em cima de voce
        const swooping = this._updateSwoop(npc);

        // No mergulho ele vem direto. Pairando fica acima, mas se voce subir
        // acima dele, ele para de fugir pro alto e vai atras.
        const wantY = (swooping || playerCenter.Y < center.Y)
            ? playerCenter.Y
            : playerCenter.Y - HOVER_ABOVE;

        npc.localAI[0]--;
        if (npc.localAI[0] <= 0) {
            npc.localAI[0] = REAIM_MIN + Math.random() * (REAIM_MAX - REAIM_MIN);
            npc.localAI[1] = (Math.random() - 0.5) * 2 * ANGLE_JITTER;
            npc.localAI[2] = Math.random() < 0.5 ? -1 : 1;
        }

        // Pairando ele mira um pouco depois de voce, alternando de lado: e isso
        // que faz ele cruzar a sua vertical em vez de tentar se equilibrar em
        // cima. No mergulho ele vai reto, sem desvio.
        const overshoot = swooping ? 0 : (npc.localAI[2] || 1) * OVERSHOOT;
        let dx = (playerCenter.X + overshoot) - center.X;
        let dy = wantY - center.Y;
        if (!swooping && Math.abs(dy) < HOVER_DEADZONE) dy = 0;

        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const dirX = dx / dist;
        const dirY = dy / dist;

        const ca = Math.cos(npc.localAI[1]);
        const sa = Math.sin(npc.localAI[1]);
        const rx = dirX * ca - dirY * sa;
        const ry = dirX * sa + dirY * ca;

        npc.ai[0] += WOBBLE;
        if (npc.ai[0] > Math.PI * 2) npc.ai[0] -= Math.PI * 2;
        const sine = Math.sin(npc.ai[0]);

        const speed = SPEED * (swooping ? SWOOP_SPEED : 1);
        const wobble = swooping ? WOBBLE_STRENGTH * 0.4 : WOBBLE_STRENGTH;
        const wantVX = rx * speed - ry * sine * wobble;
        const wantVY = ry * speed + rx * sine * wobble;
        const max = MAX_SPEED * (swooping ? SWOOP_SPEED : 1);

        const vel = npc.velocity;
        let vx = vel.X + (wantVX - vel.X) * ACCEL;
        let vy = vel.Y + (wantVY - vel.Y) * ACCEL;

        if (vx > max) vx = max;
        else if (vx < -max) vx = -max;
        if (vy > max) vy = max;
        else if (vy < -max) vy = -max;

        npc.velocity = Vector2.new(vx, vy);

        if (Math.abs(vx) > FACE_DEADZONE) npc.direction = vx > 0 ? 1 : -1;
        npc.spriteDirection = npc.direction * FACE_FLIP;

        this._tryShoot(npc, player);
    }

    /**
     * localAI[3] positivo = pairando, negativo = mergulhando. Devolve true
     * enquanto ele estiver no mergulho.
     */
    _updateSwoop(npc) {
        if (npc.localAI[3] === 0) {
            npc.localAI[3] = HOVER_MIN + Math.random() * (HOVER_MAX - HOVER_MIN);
        }

        if (npc.localAI[3] > 0) {
            npc.localAI[3]--;
            if (npc.localAI[3] <= 0) {
                npc.localAI[3] = -(SWOOP_MIN + Math.random() * (SWOOP_MAX - SWOOP_MIN));
            }
            return false;
        }

        npc.localAI[3]++;
        if (npc.localAI[3] >= 0) {
            npc.localAI[3] = HOVER_MIN + Math.random() * (HOVER_MAX - HOVER_MIN);
        }
        return true;
    }

    _tryShoot(npc, player) {
        npc.ai[1]++;
        if (npc.ai[1] < 0) return;

        const center = npc.Center;
        const playerVelX = player.velocity.X;
        const standing = playerVelX === 0;
        const lead = standing ? 0 : playerVelX * LEAD;

        // Voce precisa estar embaixo dele, dentro da sua largura (contando a
        // sobra pra onde voce esta correndo) e a no maximo 800px abaixo
        const left = player.position.X + lead;
        const right = player.position.X + player.width + lead;
        if (center.X < left || center.X > right) return;

        const drop = player.position.Y - (npc.position.Y + npc.height);
        if (drop <= 0 || drop >= MAX_DROP) return;

        if (!CanHit(npc.position, npc.width, npc.height, player.position, player.width, player.height)) return;

        if (_zapType === -1) _zapType = ModProjectile.getTypeByName('Zap') ?? -2;

        if (_zapType >= 0) {
            // Parado ele erra de proposito pro lado que esta virado
            const offsetX = standing ? -npc.direction * Rand.Next(7, 16) : 0;

            NewProjectile(
                null,
                (center.X | 0) + offsetX, (center.Y | 0) + 16,
                0, SHOT_SPEED,
                _zapType, SHOT_DAMAGE, 1, Main.myPlayer,
                0, 0, 0, null
            );
        }

        npc.ai[1] = -SHOT_COOLDOWN;
    }

    /**
     * Camada de brilho por cima do corpo, usando o mesmo quadro da animacao.
     *
     * O C# desenha em npc.position com origem Zero. Isso so funciona sem
     * espelhamento: com origem no canto, o flip gira em volta daquele canto e
     * joga a imagem inteira uma largura pro lado. Por isso aqui a gente
     * desenha no centro com a origem no centro do quadro, igual ao GildedLycan.
     */
    PostDraw(npc, spriteBatch, screenPos) {
        if (!this._texLoaded) {
            this._texLoaded = true;
            try { this._glow = tl.texture.load('Textures/NPCs/FloatingIslands/WindElemental_Effect.png'); } catch (_) { }
        }
        if (!this._glow) return;

        const frames = Main.npcFrameCount[this.Type] || 1;
        const origin = Vector2.new(this._glow.Width / 2, (this._glow.Height / frames) / 2);

        spriteBatch[DRAW](
            this._glow,
            Vector2.new(
                npc.Center.X - screenPos.X,
                npc.Center.Y - screenPos.Y + npc.gfxOffY
            ),
            npc.frame, Color.White, npc.rotation, origin, npc.scale,
            npc.spriteDirection === 1 ? SpriteEffects.FlipHorizontally : SpriteEffects.None,
            0
        );
    }

    HitEffect(npc, hitDirection, damage) {
        if (npc.life <= 0) {
            FxHelper.burst(npc.position, npc.width, npc.height, 15, 1, 2.5, 1.25, 125, false);
            FxHelper.burst(npc.position, npc.width, npc.height, 15, 57, 2.5, 0.75, 125, false);
            return;
        }

        const count = Math.min(6, Math.floor(damage / npc.lifeMax * 50));
        FxHelper.burst(npc.position, npc.width, npc.height, count, 57, 1, 0.75, 125, false);
    }

    ModifyNPCLoot(npcLoot) {
        npcLoot.Add(ItemDropRule.Common(Terraria.ID.ItemID.Cloud, 1, 5, 10));
        npcLoot.Add(ItemDropRule.Common(ModItem.getTypeByName('TheZapper'), 10, 1, 1));
    }
}
