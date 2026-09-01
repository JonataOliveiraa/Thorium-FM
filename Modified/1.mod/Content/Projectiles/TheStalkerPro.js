import { RottenCodPro } from './RottenCodPro.js';

export class TheStalkerPro extends RottenCodPro {
    constructor() {
        super();
        this.Texture = 'Projectiles/' + this.constructor.name;
    }

    get Size() {
        return 22;
    }
}
