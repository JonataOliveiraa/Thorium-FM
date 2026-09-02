import { Maid1 } from './Maid1.js';

export class Maid2 extends Maid1 {
    constructor() {
        super();
        this.Texture = 'Pets/' + this.constructor.name;
    }
}
