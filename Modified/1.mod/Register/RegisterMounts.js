import { ModMount } from '../TL/ModMount.js';

import { MagmaCharm } from "../Content/Mounts/MagmaCharm.js";

const List = [
    MagmaCharm
]
export function RegisterMounts() {
    for (const Mount of List) {
        ModMount.register(Mount)
    }
}