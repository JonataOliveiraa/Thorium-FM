import { Terraria, Modules } from '../TL/ModImports.js';

const { Rand } = Modules;
const { AmmoID } = Terraria.ID;

export class AmmoHelper {
    static Pick(player, ammoId) {
        if (!(ammoId > 0)) return null;

        const inventory = player.inventory;

        for (let i = 54; i < 58; i++) {
            const slot = inventory[i];
            if (slot && slot.ammo === ammoId && slot.stack > 0) return slot;
        }
        for (let i = 0; i < 54; i++) {
            const slot = inventory[i];
            if (slot && slot.ammo === ammoId && slot.stack > 0) return slot;
        }

        return null;
    }

    static Has(player, ammoId) {
        return AmmoHelper.Pick(player, ammoId) !== null;
    }

    static CanConsume(player, ammoId) {
        try {
            if (player.magicQuiver && (ammoId === AmmoID.Arrow || ammoId === AmmoID.Stake) && Rand.Next(0, 5) === 0) return false;
            if (player.ammoBox && Rand.Next(0, 5) === 0) return false;
            if (player.ammoPotion && Rand.Next(0, 5) === 0) return false;
            if (player.chloroAmmoCost80 && Rand.Next(0, 5) === 0) return false;
            if (player.ammoCost80 && Rand.Next(0, 5) === 0) return false;
            if (player.ammoCost75 && Rand.Next(0, 4) === 0) return false;
        } catch (_) { }

        return true;
    }

    static Consume(player, ammoId) {
        const slot = AmmoHelper.Pick(player, ammoId);
        if (!slot) return -1;

        let projToShoot = slot.shoot > 0 ? slot.shoot : -1;
        try {
            if (player.hasMoltenQuiver && projToShoot === 1) projToShoot = 2;
        } catch (_) { }
        if (projToShoot <= 0) return -1;

        if (slot.consumable && AmmoHelper.CanConsume(player, ammoId)) {
            slot.stack--;
            if (slot.stack <= 0) slot['void TurnToAir(bool fullReset)'](true);
        }

        return projToShoot;
    }
}
