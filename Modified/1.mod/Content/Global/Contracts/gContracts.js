import { GlobalNPC } from '../../../TL/GlobalNPC.js';
import { ContractVault } from './ContractVault.js';

export class gContracts extends GlobalNPC {
    constructor() {
        super();
    }

    OnKill(npc) {
        if (!npc || npc.SpawnedFromStatue) return;
        ContractVault.OnMonsterKilled(npc);
    }
}
