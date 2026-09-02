import { ModSystem } from '../../../TL/ModSystem.js';
import { ContractVault } from './ContractVault.js';

export class ContractSystem extends ModSystem {
    OnWorldLoad() {
        ContractVault.Load();
    }

    OnWorldUnload() {
        ContractVault.Completed = new Set();
    }
}
