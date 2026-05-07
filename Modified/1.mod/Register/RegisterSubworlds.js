import { Subworld } from "../TL/Subworld.js";

const List = [

]

export function RegisterSubworlds() {
    for (const Subw of List) {
        Subworld.register(Subw)
    }
}