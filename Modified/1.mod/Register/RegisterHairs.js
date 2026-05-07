import { ModHair } from '../TL/ModHair.js';

const List = [

]
export function RegisterHairs() {
    for(const Hair of List) {
        ModHair.register(Hair)
    }
}