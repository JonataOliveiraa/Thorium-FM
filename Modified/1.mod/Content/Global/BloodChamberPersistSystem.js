import { ModSystem } from '../../TL/ModSystem.js';
import { WorldDB } from '../../TL/WorldDB.js';
import { BloodChamberStructure } from '../Structures/BloodChamberStructure.js';

export class BloodChamberPersistSystem extends ModSystem {
    OnWorldLoad() {
        const pending = BloodChamberStructure.PendingPosition;
        if (!pending) return;

        if (!WorldDB.has('Thorium:BloodChamberPosXY')) {
            WorldDB.set('Thorium:BloodChamberPosXY', JSON.stringify({ X: pending.X * 16, Y: pending.Y * 16 }));
            WorldDB.Instance.Save();
        }

        BloodChamberStructure.PendingPosition = null;
    }
}