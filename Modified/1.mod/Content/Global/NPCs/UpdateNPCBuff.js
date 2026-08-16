import { GlobalNPC } from "../../../TL/GlobalNPC.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Effects } from "../../../TL/Modules/Effects.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";
import { ElementalDecayBuff } from "../../Buffs/ElementalDecayBuff.js";
import { SingedBuff } from "../../Buffs/SingedBuff.js";
import { GraniteSurgeBuff } from "../../Buffs/GraniteSurgeBuff.js";

const { NPCID } = Terraria.ID;
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

const FindBuffIndex = 'int FindBuffIndex(int type)';
const StrikeNPCNoInteraction = 'double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)';

const BlackList = new Set([
    NPCID.EaterofWorldsHead,
    NPCID.EaterofWorldsBody,
    NPCID.EaterofWorldsTail,
    NPCID.GiantWormHead,
    NPCID.GiantWormBody,
    NPCID.GiantWormTail,
    NPCID.TheDestroyer,
    NPCID.TheDestroyerBody,
    NPCID.TheDestroyerTail,
]);

let StunnedBuffType = -1;
let PetrifyBuffType = -1;
let CharmedBuffType = -1;
let ElementalDecayBuffType = -1;
let SingedBuffType = -1
let DistortedTimeEnemy = -1
let GraniteSurgeBuffType = -1
function initBuffTypes() {
    StunnedBuffType = ModBuff.getTypeByName("StunnedBuff");
    PetrifyBuffType = ModBuff.getTypeByName("PetrifyBuff");
    CharmedBuffType = ModBuff.getTypeByName("CharmedBuff");
    ElementalDecayBuffType = ModBuff.getTypeByName("ElementalDecayBuff");
    SingedBuffType = ModBuff.getTypeByName("SingedBuff")
    DistortedTimeEnemy = ModBuff.getTypeByName("DistortedTimeEnemy")
    GraniteSurgeBuffType = ModBuff.getTypeByName("GraniteSurgeBuff")
}

const dtVec2 = Vector2.new(0.60, 0.60)
const charmVec2 = Vector2.new(0.85, 0.85)

// Color.Pink / Color.Transparent sao getters nativos: guardamos uma copia
const PINK = Color.Pink;
const TRANSPARENT = Color.Transparent;
// 0.45 * 255: o mesmo fator do buffColor usado pelo Petrify original.
const STONE = Color.new(115, 115, 115);

const PETRIFY_DUST_OFFSET = Vector2.new(2, 2);

const TINT_NONE = 0;
const TINT_PINK = 1;
const TINT_STONE = 2;

// Lembra com que cor cada slot de NPC esta tingido, pra so escrever npc.color
// quando a cor realmente muda em vez de reescrever toda hora
const tinted = new Uint8Array(Terraria.Main.maxNPCs);

export class UpdateNPCBuff extends GlobalNPC {
    constructor() {
        super();
    }

    PreAI(npc) {
        if (!npc.boss) {
            if (ThoriumPlayer.repellentBats && ThoriumPlayer.IsBatNPC(npc)) {
                if (npc.target !== 255) npc.target = 255;
            }
            if (ThoriumPlayer.repellentFish && ThoriumPlayer.IsFishNPC(npc)) {
                if (npc.target !== 255) npc.target = 255;
            }
            if (ThoriumPlayer.repellentInsects && ThoriumPlayer.IsInsectNPC(npc)) {
                if (npc.target !== 255) npc.target = 255;
            }
            if (ThoriumPlayer.repellentSkeletons && ThoriumPlayer.IsSkeletonNPC(npc)) {
                if (npc.target !== 255) npc.target = 255;
            }
            if (ThoriumPlayer.repellentZombies && ThoriumPlayer.IsZombieNPC(npc)) {
                if (npc.target !== 255) npc.target = 255;
            }
        }

        return true;
    }

    // Tudo que mexe em velocity/position precisa rodar DEPOIS da AI nativa.
    // Antes isso vivia no PreAI, onde era inofensivo: a AI do NPC reescreve a
    // velocidade logo em seguida, e no PreAI `position` ainda e' igual a
    // `oldPosition` - ou seja, o congelamento do Petrify nunca acontecia.
    PostAI(npc) {
        if (StunnedBuffType === -1) initBuffTypes();
        if (npc.buffType[0] === 0) {
            const slot = npc.whoAmI;
            if (tinted[slot]) {
                tinted[slot] = TINT_NONE;
                npc.color = TRANSPARENT;
            }
            return;
        }

        // Um passo unico pela lista de buffs em vez de 5 FindBuffIndex nativos
        // por NPC por tick. Sai fora no primeiro slot vazio.
        let stunned = false, petrified = false, charmed = false, elemental = false, singed = false, distorted = false;
        const slots = npc.buffType.length;
        for (let i = 0; i < slots; i++) {
            const t = npc.buffType[i];
            if (t === 0) break;
            if (t === StunnedBuffType) stunned = true;
            else if (t === PetrifyBuffType) petrified = true;
            else if (t === CharmedBuffType) charmed = true;
            else if (t === ElementalDecayBuffType) elemental = true;
            else if (t === SingedBuffType) singed = true;
            else if (t === DistortedTimeEnemy) distorted = true;
        }

        const slot = npc.whoAmI;

        if (!stunned && !petrified && !charmed && !elemental && !singed && !distorted) {
            if (tinted[slot]) {
                tinted[slot] = TINT_NONE;
                npc.color = TRANSPARENT;
            }
            return;
        }

        const isSmallNonBoss = !BlackList.has(npc.type) && npc.lifeMax < 900 && !npc.boss;
        const frozen = petrified && isSmallNonBoss;

        if (frozen) {
            npc.position = npc.oldPosition;
            npc.netOffset = Vector2.Zero;
            npc.frameCounter = 0;
            npc.velocity = Vector2.Zero;
            this._petrifyEffects(npc);
        } else if (stunned && isSmallNonBoss) {
            npc.velocity = Vector2.Zero;
        }

        // Pedra tem prioridade visual sobre o rosa do Charmed.
        const wantTint = frozen ? TINT_STONE : (charmed && isSmallNonBoss) ? TINT_PINK : TINT_NONE;
        if (tinted[slot] !== wantTint) {
            tinted[slot] = wantTint;
            npc.color = wantTint === TINT_STONE ? STONE : wantTint === TINT_PINK ? PINK : TRANSPARENT;
        }

        if (charmed && isSmallNonBoss) {
            if (!frozen) npc.velocity = Vector2.Multiply(npc.velocity, charmVec2);

            if (Math.random() >= 0.85) {
                let vec2 = Vector2.new(Rand.Next(-10, 11), Rand.Next(-10, 11));
                vec2 = Vector2.Normalize(vec2);
                vec2.X *= 0.66;
                const index = NewGore(
                    Vector2.Add(npc.position, Vector2.new(Rand.Next(npc.width + 1), Rand.Next(npc.height + 1))),
                    Vector2.Multiply(vec2, Rand.Next(3, 6) * 0.33),
                    331,
                    Rand.Next(40, 121) * 0.01
                );
                Terraria.Main.gore[index].sticky = false;
            }
        }

        if (elemental) {
            npc.localAI[0]++;

            if (Rand.NextChance(0.25)) {
                if (npc.localAI[0] >= 60) {
                    npc.localAI[0] = 0;
                    npc[StrikeNPCNoInteraction](
                        ElementalDecayBuff.Damage,
                        0,
                        npc.direction ?? 1,
                        false, false, false
                    );
                }
                for (let type = 86; type <= 90; type++) {
                    const dustIndex = NewDust(
                        npc.position, npc.width, npc.height,
                        type, 0, -1, 100,
                        TRANSPARENT, 0.75
                    );
                    if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                        const dust = Terraria.Main.dust[dustIndex];
                        dust.noGravity = true;
                        if (Rand.NextChance(0.25)) dust.scale *= 0.6;
                    }
                }
            }
        }

        if (singed) {
            npc.localAI[1]++;

            if (Rand.NextChance(0.25)) {
                if (npc.localAI[1] >= 60) {
                    npc.localAI[1] = 0;
                    npc[StrikeNPCNoInteraction](
                        SingedBuff.Damage,
                        0,
                        npc.direction ?? 0.7,
                        false, false, false
                    );
                }
                
                const sparkIdx = NewDust(
                    npc.position, npc.width, npc.height,
                    66,
                    (Math.random() - 0.5) * 2,
                    (Math.random() - 0.5) * 2,
                    150, Color.LightGoldenrodYellow, 0.4
                );
                const spark = Terraria.Main.dust[sparkIdx];
                if (spark) {
                    spark.noGravity = true;
                    spark.fadeIn = 0.6;
                }
            }
        }

        if (distorted && isSmallNonBoss && !frozen) {
            npc.velocity = Vector2.Multiply(npc.velocity, dtVec2);
        }
    }

    // Lascas de pedra saindo do alvo + a luz apagada do Petrify original.
    _petrifyEffects(npc) {
        Effects.AddLight(npc.Center, 0.1, 0.1, 0.1);

        if (Rand.Next(4) === 0) return;

        const dustIndex = NewDust(
            Vector2.Subtract(npc.position, PETRIFY_DUST_OFFSET),
            npc.width, npc.height,
            1, 0, 0, 100, TRANSPARENT, 0.6
        );
        const dust = Terraria.Main.dust[dustIndex];
        if (!dust) return;

        dust.noGravity = true;
        const velocity = Vector2.Multiply(dust.velocity, 1.8);
        velocity.Y -= 0.5;
        dust.velocity = velocity;

        if (Rand.Next(4) === 0) {
            dust.noGravity = false;
            dust.scale *= 0.5;
        }
    }

    // DoT do Granite Surge. Vai por lifeRegen (o caminho nativo de debuff)
    // em vez de um contador em localAI, que ja esta ocupado por outros NPCs.
    UpdateLifeRegen(npc, damage) {
        if (GraniteSurgeBuffType === -1) initBuffTypes();
        if (npc[FindBuffIndex](GraniteSurgeBuffType) < 0) return;

        if (npc.lifeRegen > 0) npc.lifeRegen = 0;
        npc.lifeRegen -= GraniteSurgeBuff.Damage;

        if (Math.random() >= 0.2) return;
        const sparkIdx = NewDust(
            npc.position, npc.width, npc.height,
            59, 0, 0, 100, TRANSPARENT, 1
        );
        const spark = Terraria.Main.dust[sparkIdx];
        if (spark) spark.noGravity = true;
    }

    // O framework nao expoe um hook de "dano recebido" pra NPC, entao o extra
    // de 5% e aplicado como um golpe sem intera\u00e7\u00e3o logo apos o acerto.
    OnHitByPlayer(npc, player, item, damageDone, knockBack) {
        if (GraniteSurgeBuffType === -1) initBuffTypes();
        if (!damageDone || npc[FindBuffIndex](GraniteSurgeBuffType) < 0) return;

        const extra = Math.floor(damageDone * GraniteSurgeBuff.DamageTakenBonus);
        if (extra < 1) return;
        npc[StrikeNPCNoInteraction](extra, 0, npc.direction ?? 1, false, true, false);
    }

    ModifyHitPlayer(npc, player, modifiers) {
        if (StunnedBuffType === -1) initBuffTypes();
        if (BlackList.has(npc.type) || npc.lifeMax >= 400 || npc.boss) return;
        if (npc[FindBuffIndex](CharmedBuffType) > -1) {
            modifiers.damage = modifiers.damage * 0.80;
        }
    }

    OnKill(npc) {
        if (ThoriumPlayer.LuckyRabbitsFootEquipped && Rand.Next(0, 5) === 0) {
            ThoriumPlayer.LuckyRabbitsFootSpawnCoins(npc);
        }

        // 60% de chance, e so se o jogador tiver recurso guardado (>0).
        if (ThoriumPlayer.FabergeEggEquipped) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer];
            ThoriumPlayer.TrySpawnFabergeEgg(player, npc, ThoriumPlayer.FabergeEggKillChance);
        }
    }
}
