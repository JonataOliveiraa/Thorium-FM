import { Terraria, Microsoft, Modules } from '../../TL/ModImports.js';
import { ModInterface } from './ModInterface.js';
import { ModButton } from './ModButton.js';
import { UIDraw } from './UIDraw.js';
import { ModLocalization } from '../../TL/ModLocalization.js';
import { ContractVault } from '../Global/Contracts/ContractVault.js';

const { Color, Rectangle, Vector2 } = Modules;
const { Main } = Terraria;

const COLOR_WHITE = Microsoft.Xna.Framework.Graphics.Color.White;

const ICON_PATH = 'Textures/UI/Contracts/';
const CLOSE_PATH = ICON_PATH + 'close-icon.png';

const CARD_W = 65;
const CARD_H = 64;
const CARD_GAP = 10;
const COLUMNS = 4;

const FRAME_REVEALED = 0;
const FRAME_HIDDEN = 1;

const PANEL_PAD = 16;
const PANEL_MIN_W = 420;
const TITLE_H = 34;
const DESC_H = 100;
const DESC_LINE = 19;
const DESC_CHARS = 52;
const DESC_MAX_LINES = 4;

const CLOSE_SIZE = 22;
const CLOSE_INSET = 10;

const BORDER_PATH = ICON_PATH + 'Border.png';
const BORDER_PAD = 4;
const BORDER_HOVER_ALPHA = 120;

const TITLE_SCALE = 1.15;
const DESC_SCALE = 0.85;

const PANEL_R = 54;
const PANEL_G = 70;
const PANEL_B = 127;
const PANEL_A = 210;

class ContractCard extends ModButton {
    constructor(owner, contract) {
        super();
        this.owner = owner;
        this.contract = contract;
        this.texture = null;
        this.source = null;
        this.border = null;
        this.borderArea = Rectangle.new();
    }

    Load() {
        if (this.texture !== null) return;
        try {
            this.texture = tl.texture.load(ICON_PATH + this.contract.key + '.png');
            this.source = Rectangle.new(0, 0, CARD_W, CARD_H);
        } catch (e) {
            this.texture = false;
        }
        try {
            this.border = tl.texture.load(BORDER_PATH);
        } catch (e) {
            this.border = false;
        }
    }

    GetTexture() {
        this.Load();
        return this.texture || null;
    }

    Draw(rect) {
        const texture = this.GetTexture();
        if (!texture) return;

        const frame = ContractVault.IsCompleted(this.contract.key) ? FRAME_REVEALED : FRAME_HIDDEN;
        this.source.X = frame * CARD_W;

        UIDraw.RectangleFramed(texture, rect, this.source, COLOR_WHITE);

        const selected = this.owner.selected === this.contract;
        if (!selected && !this.Hovered) return;
        if (!this.border) return;

        this.borderArea.X = rect.X - BORDER_PAD;
        this.borderArea.Y = rect.Y - BORDER_PAD;
        this.borderArea.Width = rect.Width + BORDER_PAD * 2;
        this.borderArea.Height = rect.Height + BORDER_PAD * 2;

        UIDraw.Rectangle(
            this.border,
            this.borderArea,
            selected ? COLOR_WHITE : Color.new(255, 255, 255, BORDER_HOVER_ALPHA)
        );
    }

    OnClick() {
        this.owner.selected = this.contract;
    }
}

class CloseButton extends ModButton {
    constructor(owner) {
        super();
        this.owner = owner;
        this.texture = null;
    }

    GetTexture() {
        if (this.texture === null) {
            try {
                this.texture = tl.texture.load(CLOSE_PATH);
            } catch (e) {
                this.texture = false;
            }
        }
        return this.texture || null;
    }

    GetColor() {
        return this.Hovered ? Color.new(255, 220, 120) : COLOR_WHITE;
    }

    OnClick() {
        this.owner.Visible = false;
    }
}

export class TrackerInterface extends ModInterface {
    constructor() {
        super();
        this.selected = null;
        this.cards = [];
        this.close = null;
        this.Panel = Rectangle.new();
        this.Layout = null;
    }

    SetupContent() {
        const contracts = ContractVault.GetContracts();
        this.cards = contracts.map(c => new ContractCard(this, c));
        this.close = new CloseButton(this);

        this.rows = Math.ceil(this.cards.length / COLUMNS);
        this.gridWidth = COLUMNS * CARD_W + (COLUMNS - 1) * CARD_GAP;

        this.PanelWidth = Math.max(this.gridWidth + PANEL_PAD * 2, PANEL_MIN_W);
        this.PanelHeight = PANEL_PAD * 2 + TITLE_H + this.rows * (CARD_H + CARD_GAP) + DESC_H;
        this.Layout = this.CreateLayout(this.PanelWidth, this.PanelHeight);
    }

    Clear() {
        this.Visible = false;
        this.selected = null;
    }

    Draw() {
        if (!this.Visible) return;
        this.EnsureSetup();

        this.Panel.X = Math.floor(Main.screenWidth * 0.5 - this.PanelWidth * 0.5);
        this.Panel.Y = Math.floor(Main.screenHeight * 0.5 - this.PanelHeight * 0.5);
        this.Panel.Width = this.PanelWidth;
        this.Panel.Height = this.PanelHeight;

        this.Recalculate(this.Layout, this.Panel);
        UIDraw.InvBG(this.Panel, Color.new(PANEL_R, PANEL_G, PANEL_B, PANEL_A));

        this.DrawTitle();
        this.DrawCards();
        this.DrawDescription();
        this.DrawClose();
    }

    DrawTitle() {
        const done = ContractVault.CompletedCount();
        const total = ContractVault.GetContracts().length;
        const title = ModLocalization.Translate('Others.TrackerContracts') + '  ' + done + '/' + total;

        UIDraw.BorderStringCentered(
            title,
            Vector2.new(this.Panel.X + this.PanelWidth * 0.5, this.Panel.Y + PANEL_PAD + TITLE_H * 0.4),
            COLOR_WHITE,
            TITLE_SCALE
        );
    }

    DrawCards() {
        const startX = this.Panel.X + Math.floor((this.PanelWidth - this.gridWidth) * 0.5);
        const startY = this.Panel.Y + PANEL_PAD + TITLE_H;

        for (let i = 0; i < this.cards.length; i++) {
            const card = this.cards[i];
            const rect = card.Area;

            rect.X = startX + (i % COLUMNS) * (CARD_W + CARD_GAP);
            rect.Y = startY + Math.floor(i / COLUMNS) * (CARD_H + CARD_GAP);
            rect.Width = CARD_W;
            rect.Height = CARD_H;

            ModButton.UpdateButton(card, rect);
            card.Draw(rect);
        }
    }

    DrawDescription() {
        const contract = this.selected;
        if (!contract) return;

        const baseY = this.Panel.Y + PANEL_PAD + TITLE_H + this.rows * (CARD_H + CARD_GAP);
        const centerX = this.Panel.X + this.PanelWidth * 0.5;
        const done = ContractVault.IsCompleted(contract.key);

        UIDraw.BorderStringCentered(
            ContractVault.Title(contract),
            Vector2.new(centerX, baseY + 10),
            done ? Color.new(120, 255, 140) : COLOR_WHITE,
            1
        );

        const lines = TrackerInterface.Wrap(ContractVault.Description(contract), DESC_CHARS);
        for (let i = 0; i < lines.length; i++) {
            UIDraw.BorderStringCentered(
                lines[i],
                Vector2.new(centerX, baseY + 32 + i * DESC_LINE),
                Color.new(210, 210, 210),
                DESC_SCALE
            );
        }
    }

    DrawClose() {
        const rect = this.close.Area;
        rect.X = this.Panel.X + this.PanelWidth - CLOSE_INSET - CLOSE_SIZE;
        rect.Y = this.Panel.Y + CLOSE_INSET;
        rect.Width = CLOSE_SIZE;
        rect.Height = CLOSE_SIZE;

        ModButton.UpdateButton(this.close, rect);
        this.close.Draw(rect);
    }

    static Wrap(text, limit) {
        const words = String(text).split(' ');
        const lines = [];
        let current = '';

        for (const word of words) {
            if (current.length === 0) {
                current = word;
            } else if (current.length + 1 + word.length <= limit) {
                current += ' ' + word;
            } else {
                lines.push(current);
                if (lines.length >= DESC_MAX_LINES) return lines;
                current = word;
            }
        }

        if (current.length > 0 && lines.length < DESC_MAX_LINES) lines.push(current);
        return lines;
    }
}
