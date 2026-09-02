const SHOP_ICON_PATH = 'Textures/UI/Shop_icon.png';

let _texture = null;

export class ShopIcon {
    static Texture() {
        if (_texture === null) {
            try {
                _texture = tl.texture.load(SHOP_ICON_PATH);
            } catch (e) {
                _texture = false;
            }
        }
        return _texture || null;
    }
}
