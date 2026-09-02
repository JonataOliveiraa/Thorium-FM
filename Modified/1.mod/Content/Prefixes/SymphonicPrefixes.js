import { ModPrefix } from '../../TL/ModPrefix.js';
import { PrefixCategory } from '../../TL/PrefixCategory.js';
import { ModBardItem } from '../../Common/ModBardItem.js';

const TICKS_PER_SECOND = 60;

export class SymphonicPrefix extends ModPrefix {
    get Category() {
        return PrefixCategory.Custom;
    }

    get EmpowermentTicks() {
        return this.EmpowermentSeconds * TICKS_PER_SECOND;
    }

    get EmpowermentSeconds() {
        return 0;
    }

    CanRoll(item) {
        return ModBardItem.bardItemsName.has(item.type);
    }
}

export class Loud extends SymphonicPrefix {
    SetStats(stats) {
        stats.damage += 0.10;
        stats.crit += 3;
    }
}

export class Supersonic extends SymphonicPrefix {
    SetStats(stats) {
        stats.speed -= 0.15;
        stats.shootSpeed += 0.10;
    }
}

export class Vibrant extends SymphonicPrefix {
    SetStats(stats) {
        stats.speed -= 0.10;
        stats.shootSpeed += 0.15;
    }
}

export class Euphonic extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return 2;
    }

    SetStats(stats) {
        stats.shootSpeed += 0.05;
    }
}

export class Melodic extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return 1;
    }

    SetStats(stats) {
        stats.damage += 0.10;
        stats.speed -= 0.05;
        stats.crit += 2;
        stats.shootSpeed += 0.05;
    }
}

export class Inspiring extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return 2;
    }

    SetStats(stats) {
        stats.damage += 0.10;
    }
}

export class Muted extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return -1;
    }

    SetStats(stats) {
        stats.damage -= 0.15;
        stats.shootSpeed -= 0.10;
    }
}

export class OffKey extends SymphonicPrefix {
    SetStats(stats) {
        stats.speed += 0.15;
        stats.shootSpeed -= 0.10;
    }
}

export class Rambling extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return -2;
    }

    SetStats(stats) {
        stats.speed += 0.10;
    }
}

export class Refined extends SymphonicPrefix {
    SetStats(stats) {
        stats.damage += 0.15;
        stats.speed += 0.10;
        stats.crit += 1;
    }
}

export class Buzzing extends SymphonicPrefix {
    SetStats(stats) {
        stats.damage -= 0.15;
        stats.speed -= 0.15;
    }
}

export class Fabled extends SymphonicPrefix {
    get EmpowermentSeconds() {
        return 2;
    }

    SetStats(stats) {
        stats.damage += 0.15;
        stats.speed -= 0.10;
        stats.crit += 5;
        stats.shootSpeed += 0.10;
    }
}
