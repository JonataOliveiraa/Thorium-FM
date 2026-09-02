import { ModBardItem } from "../../../Common/ModBardItem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModBuff } from "../../../TL/ModBuff.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { ModItem as ModItemLoader } from "../../../TL/ModItem.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";

const NewItem = Terraria.Item['int NewItem(int X, int Y, int Width, int Height, int Type, int Stack, bool noBroadcast, int pfix, bool noGrabDelay)'];
const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThoriumClassCrit extends GlobalHooks {
    constructor() {
        super()
    }

    static _muteBurst1Type = -1;
    static _stunnedType = -1;
    static _singedType = -1;
    static _mixtapeNoteType = -1;

    static MIXTAPE_SINGED_TIME = 120;
    static MIXTAPE_NOTES = 6;
    static MIXTAPE_NOTE_SPEED = 6;
    static MIXTAPE_NOTE_KNOCKBACK = 2;
    static MIXTAPE_NOTE_DAMAGE_DIVISOR = 4;
    static MIXTAPE_NOTE_STYLES = 3;

    static _inspirationNoteType = -1;
    static _nobleNoteType = -1;
    static INSPIRATION_DROP_CHANCE = 0.1;

    Initialize() {
        Terraria.NPC.StrikeNPC.hook((original, self, damage, knockback, hitDirection, crit, noEffect, fromNet, owner) => {
            if (owner < 0 || owner >= Terraria.Main.player.length) {
                return original(self, damage, knockback, hitDirection, crit, noEffect, fromNet, owner);
            }

            const player = Terraria.Main.player[owner];
            if (!player || !player.active || !player.HeldItem) {
                return original(self, damage, knockback, hitDirection, crit, noEffect, fromNet, owner);
            }

            const type = player.HeldItem.type;

            const isBard = ModBardItem.bardItemsName.has(type);

            let didCrit = crit;
            if (!didCrit && ModHealerItem.healerItemsName.has(type) && Rand.Next(100) < ThoriumPlayer.class.Healer.radiantCrit) didCrit = true;
            if (!didCrit && isBard && Rand.Next(100) < ThoriumPlayer.class.Bard.symphonicCrit) didCrit = true;

            if (isBard && ThoriumPlayer.accMixtape) {
                if (ThoriumClassCrit._singedType === -1) ThoriumClassCrit._singedType = ModBuff.getTypeByName('SingedBuff') ?? -2;
                if (ThoriumClassCrit._singedType >= 0) self.AddBuff(ThoriumClassCrit._singedType, ThoriumClassCrit.MIXTAPE_SINGED_TIME, false);
            }

            if (didCrit) {
                const style = ModItem.getModItem(type)?.timerStyle;

                if (isBard && ThoriumPlayer.accMixtape) ThoriumClassCrit.EruptNotes(self, damage, owner);

                if (ThoriumPlayer.PlungerMuteActive && style === 'Brass') {
                    if (ThoriumClassCrit._muteBurst1Type === -1) ThoriumClassCrit._muteBurst1Type = ModProjectile.getTypeByName('MuteBurst1');
                    const spawnPos = self.Center;
                    for (let i = 0; i < Rand.Next(1, 4); i++) {
                        const velocity = Vector2.new(Rand.Next(-2, 2), Rand.Next(-2, 2));
                        NewProjectile(
                            null,
                            spawnPos, velocity, ThoriumClassCrit._muteBurst1Type,
                            Math.max(1, Math.round(damage / 3)), 0, owner, 0, 0, 0, null
                        );
                    }
                }

                if (ThoriumPlayer.accVibrationTuner && style === 'Percussion') {
                    if (ThoriumClassCrit._stunnedType === -1) ThoriumClassCrit._stunnedType = ModBuff.getTypeByName('StunnedBuff');
                    self.AddBuff(ThoriumClassCrit._stunnedType, 60, false);
                }
            }

            const result = original(self, damage, knockback, hitDirection, didCrit, noEffect, fromNet, owner);

            if (isBard && !self.active) ThoriumClassCrit.DropInspirationNote(self);

            return result;
        });
    }

    static EruptNotes(npc, damage, owner) {
        if (ThoriumClassCrit._mixtapeNoteType === -1) {
            ThoriumClassCrit._mixtapeNoteType = ModProjectile.getTypeByName('MixtapeNote') ?? -2;
        }
        if (ThoriumClassCrit._mixtapeNoteType < 0) return;

        const style = Rand.Next(ThoriumClassCrit.MIXTAPE_NOTE_STYLES);
        const speed = ThoriumClassCrit.MIXTAPE_NOTE_SPEED;
        const noteDamage = Math.max(1, (damage / ThoriumClassCrit.MIXTAPE_NOTE_DAMAGE_DIVISOR) | 0);
        const spawnPos = npc.Center;

        for (let i = 0; i < ThoriumClassCrit.MIXTAPE_NOTES; i++) {
            NewProjectile(
                null,
                spawnPos, Vector2.new(Rand.NextFloat(-speed, speed), Rand.NextFloat(-speed, speed)),
                ThoriumClassCrit._mixtapeNoteType,
                noteDamage, ThoriumClassCrit.MIXTAPE_NOTE_KNOCKBACK, owner,
                style, 0, 0, null
            );
        }
    }

    static DropInspirationNote(npc) {
        if (npc.damage <= 0) return;

        const chance = ThoriumClassCrit.INSPIRATION_DROP_CHANCE + ThoriumPlayer.bardResourceDropBoost;
        if (Rand.NextFloat(0, 1) > chance) return;

        const noble = ThoriumPlayer.setNoble;

        if (noble) {
            if (ThoriumClassCrit._nobleNoteType === -1) {
                ThoriumClassCrit._nobleNoteType = ModItemLoader.getTypeByName('InspirationNoteNoble') ?? -2;
            }
        } else if (ThoriumClassCrit._inspirationNoteType === -1) {
            ThoriumClassCrit._inspirationNoteType = ModItemLoader.getTypeByName('InspirationNote') ?? -2;
        }

        const type = noble ? ThoriumClassCrit._nobleNoteType : ThoriumClassCrit._inspirationNoteType;
        if (type < 0) return;

        NewItem(
            npc.position.X | 0, npc.position.Y | 0, npc.width, npc.height,
            type, 1, false, 0, false
        );
    }
}