import { ModCloud } from '../TL/ModCloud.js';

const List = [

]

export function RegisterClouds() {
    for(const Cloud of List) {
        ModCloud.register(Cloud)
    }
}