import { ModBiome } from '../TL/ModBiome.js';
import { AquaticDepths } from "../Content/Biomes/AquaticDepths.js";

const List = [
    AquaticDepths
]

export function RegisterBiomes() {
    for (const Biome of List) {
        ModBiome.register(Biome)
    }
}