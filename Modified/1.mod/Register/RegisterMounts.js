import { ModMount } from '../TL/ModMount.js';

import { MagmaCharm } from "../Content/Mounts/MagmaCharm.js";
import { VampiresCurseMount } from "../Content/Mounts/VampiresCurseMount.js";
import { MassiveCrabClawMount } from "../Content/Mounts/MassiveCrabClawMount.js";
import { SuperAnvilMount } from "../Content/Mounts/SuperAnvilMount.js";

const List = [
    MagmaCharm,
    VampiresCurseMount,
    MassiveCrabClawMount,
    SuperAnvilMount
]
export function RegisterMounts() {
    for (const Mount of List) {
        ModMount.register(Mount)
    }
}