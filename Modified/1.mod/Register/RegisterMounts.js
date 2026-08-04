import { ModMount } from '../TL/ModMount.js';

import { MagmaCharm } from "../Content/Mounts/MagmaCharm.js";
import { VampiresCurseMount } from "../Content/Mounts/VampiresCurseMount.js";

const List = [
    MagmaCharm,
    VampiresCurseMount
]
export function RegisterMounts() {
    for (const Mount of List) {
        ModMount.register(Mount)
    }
}