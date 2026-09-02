import { Terraria } from '../../TL/ModImports.js';

const { Main } = Terraria;

const DRAG_THRESHOLD = 4;
const MOMENTUM_KEEP = 0.92;
const MOMENTUM_STOP = 0.4;
const OVERSCROLL_PULL = 0.25;
const SNAP_EPSILON = 1;

export class ScrollView {
    constructor() {
        this.offset = 0;
        this.min = 0;
        this.velocity = 0;
        this.dragging = false;
        this.pressing = false;
        this.pressY = 0;
        this.lastY = 0;
    }

    Reset() {
        this.offset = 0;
        this.velocity = 0;
        this.dragging = false;
        this.pressing = false;
    }

    SetRange(viewHeight, contentHeight) {
        this.min = Math.min(0, viewHeight - contentHeight);
        if (this.offset < this.min) this.offset = this.min;
    }

    get Overflowing() {
        return this.min < 0;
    }

    get Offset() {
        return this.offset;
    }

    Update(x, y, width, height) {
        const inside = Main.mouseX >= x && Main.mouseX <= x + width
            && Main.mouseY >= y && Main.mouseY <= y + height;

        if (Main.mouseLeft) this.Press(inside);
        else this.Release();

        if (!this.dragging) this.Settle();
    }

    Press(inside) {
        if (!this.pressing) {
            if (!inside) return;
            this.pressing = true;
            this.dragging = false;
            this.pressY = Main.mouseY;
            this.lastY = Main.mouseY;
            this.velocity = 0;
            return;
        }

        if (!this.dragging && Math.abs(Main.mouseY - this.pressY) >= DRAG_THRESHOLD) {
            this.dragging = true;
        }

        if (this.dragging) {
            const delta = Main.mouseY - this.lastY;
            this.offset += delta;
            this.velocity = delta;
        }

        this.lastY = Main.mouseY;
    }

    Release() {
        this.pressing = false;
        this.dragging = false;
    }

    Settle() {
        this.offset += this.velocity;
        this.velocity *= MOMENTUM_KEEP;
        if (Math.abs(this.velocity) < MOMENTUM_STOP) this.velocity = 0;

        if (this.offset > 0) {
            this.offset -= this.offset * OVERSCROLL_PULL;
            if (this.offset < SNAP_EPSILON) this.offset = 0;
            return;
        }

        if (this.offset < this.min) {
            this.offset += (this.min - this.offset) * OVERSCROLL_PULL;
            if (this.min - this.offset < SNAP_EPSILON) this.offset = this.min;
        }
    }

    static Visible(y, top, height) {
        return y >= top && y <= top + height;
    }
}
