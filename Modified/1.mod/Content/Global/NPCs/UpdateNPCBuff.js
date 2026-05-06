import { GlobalNPC } from "../../../TL/GlobalNPC.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModPlayer } from "../../../TL/ModPlayer.js";
import { Color } from "../../../TL/Modules/Color.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";
import { ElementalDecayBuff } from "../../Buffs/ElementalDecayBuff.js";

const { NPCID } = Terraria.ID;
const NewGore = Terraria.Gore['int NewGore(Vector2 Position, Vector2 Velocity, int Type, float Scale)'];
const NewDust = Terraria.Dust['int NewDust(Vector2 Position, int Width, int Height, int Type, float SpeedX, float SpeedY, int Alpha, Color newColor, float Scale)'];

export class UpdateNPCBuff extends GlobalNPC {
    constructor() {
        super();
    }

    BlackList = [
        NPCID.EaterofWorldsHead,
        NPCID.EaterofWorldsBody,
        NPCID.EaterofWorldsTail,
        NPCID.GiantWormHead,
        NPCID.GiantWormBody,
        NPCID.GiantWormTail,
        NPCID.TheDestroyer,
        NPCID.TheDestroyerBody,
        NPCID.TheDestroyerTail
    ];

    PreAI(npc) {
        if (npc['int FindBuffIndex(int type)'](ModBuff.getTypeByName("StunnedBuff")) > -1 &&
            !this.BlackList.includes(npc.type) &&
            npc.lifeMax < 200 &&
            !npc.boss) {
            npc.velocity = Vector2.Zero;
        }

        if (npc['int FindBuffIndex(int type)'](ModBuff.getTypeByName("CharmedBuff")) > -1 &&
            !this.BlackList.includes(npc.type) &&
            npc.lifeMax < 200 &&
            !npc.boss) {
            npc.velocity = Vector2.Multiply(npc.velocity, Vector2.new(0.85, 0.85));
            npc.color = Color.Pink

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
            npc.color = Color.Transparent
        }

        if (npc['int FindBuffIndex(int type)'](ModBuff.getTypeByName("ElementalDecayBuff")) > -1) {
            npc.localAI[0]++

            if (Rand.NextChance(0.25)) {
                // Cria os 5 dusts um ao lado do outro
                if(npc.localAI[0] >= 60) {
                    npc.localAI[0] = 0
                    npc['double StrikeNPCNoInteraction(int Damage, float knockBack, int hitDirection, bool crit, bool noEffect, bool fromNet)'](
                        ElementalDecayBuff.Damage,
                        0,
                        npc.direction ?? 1,
                        false,
                        false,
                        false
                    );  
                } 
                for (let type = 86; type <= 90; type++) {
                    const dustIndex = NewDust(
                        npc.position, npc.width, npc.height,
                        type,
                        0, -1,
                        100,
                        Color.Transparent,
                        0.75
                    );
                    if (dustIndex >= 0 && dustIndex < Terraria.Main.dust.length) {
                        const dust = Terraria.Main.dust[dustIndex];
                        dust.noGravity = true;

                        if (Rand.NextChance(0.25)) {
                            dust.scale *= 0.6;
                        }
                    }
                }
            }
        } else {
            npc.lifeRegen = 0;
        }

        return true
    }

    ModifyHitPlayer(npc, player, modifiers) {
        if (npc['int FindBuffIndex(int type)'](ModBuff.getTypeByName("CharmedBuff")) - 1 &&
            !this.BlackList.includes(npc.type) &&
            npc.lifeMax < 400 &&
            !npc.boss) {
            modifiers.damage = modifiers.damage * 0.80
        }
    }

    OnKill(npc) {
        if(ThoriumPlayer.LuckyRabbitsFootEquipped) {
            if(Rand.Next(0, 5) === 0) {
                ThoriumPlayer.LuckyRabbitsFootSpawnCoins(npc)
            }
        }
    }
}