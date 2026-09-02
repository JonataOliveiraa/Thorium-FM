import { ModPrefix } from '../TL/ModPrefix.js';

import {
    Loud,
    Supersonic,
    Vibrant,
    Euphonic,
    Melodic,
    Inspiring,
    Muted,
    OffKey,
    Rambling,
    Refined,
    Buzzing,
    Fabled
} from '../Content/Prefixes/SymphonicPrefixes.js';

const List = [
    Loud,
    Supersonic,
    Vibrant,
    Euphonic,
    Melodic,
    Inspiring,
    Muted,
    OffKey,
    Rambling,
    Refined,
    Buzzing,
    Fabled
];

export function RegisterPrefixes() {
    for (const Prefix of List) {
        ModPrefix.register(Prefix);
    }
}
