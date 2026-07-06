import { ModBardItem } from "../../../Common/ModBardItem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { ModItem } from "../../../TL/ModItem.js";
import { ModProjectile } from "../../../TL/ModProjectile.js";
import { Rand } from "../../../TL/Modules/Rand.js";
import { Vector2 } from "../../../TL/Modules/Vector2.js";
import { ThoriumPlayer } from "../ThoriumPlayer.js";

const NewProjectile = Terraria.Projectile['int NewProjectile(IEntitySource spawnSource, Vector2 position, Vector2 velocity, int Type, int Damage, float KnockBack, int Owner, float ai0, float ai1, float ai2, NewProjectileModifier modifer)'];

export class ThoriumClassCrit extends GlobalHooks {
    constructor() {
        super()
    }

    static _muteBurst1Type;

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

            if (ThoriumPlayer.PlungerMuteActive) {
                const style = ModItem.getModItem(type)?.timerStyle;
                if (style === 'Brass' && Rand.Next(0, 5) === 0) {
                    if (ThoriumClassCrit._muteBurst1Type === -1) ThoriumClassCrit._muteBurst1Type = ModProjectile.getTypeByName('MuteBurst1');
                    const spawnPos = self.Center;
                    for (let i = 0; i < Rand.Next(1, 4); i++) {
                        const velocity = Vector2.new(Rand.Next(-2, 2), Rand.Next(-2, 2));
                        NewProjectile(
                            player.GetProjectileSource_Item(player.HeldItem),
                            spawnPos, velocity, ThoriumClassCrit._muteBurst1Type,
                            Math.max(1, Math.round(damage / 3)), 0, owner, 0, 0, 0, null
                        );
                    }
                }
            }

            if (ModHealerItem.healerItemsName.has(type) && Rand.Next(100) < ThoriumPlayer.class.Healer.radiantCrit) {
                return original(self, damage, knockback, hitDirection, true, noEffect, fromNet, owner);
            }

            if (ModBardItem.bardItemsName.has(type) && Rand.Next(100) < ThoriumPlayer.class.Bard.symphonicCrit) {
                return original(self, damage, knockback, hitDirection, true, noEffect, fromNet, owner);
            }

            return original(self, damage, knockback, hitDirection, crit, noEffect, fromNet, owner);
        });
    }
}