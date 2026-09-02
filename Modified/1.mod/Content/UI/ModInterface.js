import { Modules } from '../../TL/ModImports.js';
import { ModButton } from './ModButton.js';

const { Vector2 } = Modules;

const GUIPanel = new NativeClass('', 'GUIPanel');
const PanelLayout = new NativeClass('', 'Panel_Layout');
const LayoutCalculator = new NativeClass('', 'LayoutCalculator');

const REGISTER_REGION = 'bool RegisterPickingRegion(Panel_Layout layout)';

export class ModInterface {
    static Interfaces = [];

    constructor() {
        this.Visible = false;
        this._ready = false;
    }

    SetupContent() {

    }

    EnsureSetup() {
        if (this._ready) return true;
        this._ready = true;
        this.SetupContent();
        return true;
    }

    CreateLayout(width = 0, height = 0) {
        const layout = PanelLayout.new();
        layout['void .ctor()']();
        layout.Location = Vector2.new(0, 0);
        layout.Size = Vector2.new(width, height);
        layout.Anchor = LayoutCalculator.AnchorType.TopLeft;
        return layout;
    }

    Recalculate(layout, rect) {
        layout.Size = Vector2.new(rect.Width, rect.Height);
        layout.Location = Vector2.new(rect.X + layout.Size.X * 0.5, rect.Y + layout.Size.Y * 0.5);
        GUIPanel[REGISTER_REGION](layout);
    }

    Toggle() {
        this.Visible = !this.Visible;
    }

    Clear() {
        this.Visible = false;
    }

    Update() {

    }

    Draw() {

    }

    static register(_interface) {
        ModInterface.Interfaces.push(new _interface());
    }

    static getByName(name) {
        return ModInterface.Interfaces.find(i => i.constructor.name === name) ?? null;
    }

    static Update() {
        ModButton.Time++;
        ModButton.Update();
        for (const _interface of ModInterface.Interfaces) {
            if (_interface.Visible) _interface.Update();
        }
    }

    static Clear() {
        for (const _interface of ModInterface.Interfaces) _interface.Clear();
        ModButton.Time = 0;
        ModButton.ClearAll();
    }
}
