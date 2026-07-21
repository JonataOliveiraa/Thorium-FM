import { GlobalNPC } from "../../../TL/GlobalNPC.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";
import { ElementalDecayBuff } from "../../Buffs/ElementalDecayBuff.js";
import { SingedBuff } from "../../Buffs/SingedBuff.js";

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
let CharmedBuffType = -1;
let ElementalDecayBuffType = -1;
let SingedBuffType = -1
let DistortedTimeEnemy = -1
function initBuffTypes() {
    StunnedBuffType = ModBuff.getTypeByName("StunnedBuff");
    CharmedBuffType = ModBuff.getTypeByName("CharmedBuff");
    ElementalDecayBuffType = ModBuff.getTypeByName("ElementalDecayBuff");
    SingedBuffType = ModBuff.getTypeByName("SingedBuff")
    DistortedTimeEnemy = ModBuff.getTypeByName("DistortedTimeEnemy")
}

const dtVec2 = Vector2.new(0.60, 0.60)

export class UpdateNPCBuff extends GlobalNPC {
    constructor() {
        super();
    }

    PreAI(npc) {
        if (StunnedBuffType === -1) initBuffTypes();
        if (npc.buffType[0] === 0) return true;

        const isSmallNonBoss = !BlackList.has(npc.type) && npc.lifeMax < 900 && !npc.boss;

        const stunnedIdx = npc[FindBuffIndex](StunnedBuffType);
        const charmedIdx = npc[FindBuffIndex](CharmedBuffType);
        const elementalIdx = npc[FindBuffIndex](ElementalDecayBuffType);
        const singedIdx = npc[FindBuffIndex](SingedBuffType)
        const distortedTimeIdx = npc[FindBuffIndex](DistortedTimeEnemy)

        if (stunnedIdx > -1 && isSmallNonBoss) {
            npc.velocity = Vector2.Zero;
        }

        if (charmedIdx > -1 && isSmallNonBoss) {
            npc.velocity = Vector2.Multiply(npc.velocity, Vector2.new(0.85, 0.85));
            npc.color = Color.Pink;

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
        } else {
            npc.color = Color.Transparent;
        }

        if (elementalIdx > -1) {
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
                        Color.Transparent, 0.75
                    );
                    if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                        const dust = Terraria.Main.dust[dustIndex];
                        dust.noGravity = true;
                        if (Rand.NextChance(0.25)) dust.scale *= 0.6;
                    }
                }
            }
        }

        if (singedIdx > -1) {
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

        if(distortedTimeIdx > -1 && isSmallNonBoss) {
            npc.velocity = Vector2.Multiply(npc.velocity, dtVec2);
        }

        return true;
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

        if(ThoriumPlayer.FabergeEggEquipped) {
            const player = Terraria.Main.player[Terraria.Main.myPlayer]
            ThoriumPlayer.SpawnFabergeEgg(player, npc);
        }
    }
}
