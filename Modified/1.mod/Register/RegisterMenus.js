import { ModMenu } from '../TL/ModMenu.js';

import { ThoriumMenu } from '../Content/Menus/ThoriumMenu.js';

const List = [
    ThoriumMenu
]

export function RegisterMenus() {
    for (const Menu of List) {
        ModMenu.register(Menu)
    }
}