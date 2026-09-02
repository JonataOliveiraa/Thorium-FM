import { GlobalHooks } from '../../../TL/GlobalHooks.js';
import { Terraria } from '../../../TL/ModImports.js';
import { ModInterface } from '../../UI/ModInterface.js';
import { ModInterfaceLayer } from '../../UI/ModInterfaceLayer.js';
import { TrackerInterface } from '../../UI/TrackerInterface.js';
import { TrackerInterfaceLayer } from '../../UI/TrackerInterfaceLayer.js';

const { Main } = Terraria;
const LegacyGameInterfaceLayer = new NativeClass('Terraria.UI', 'LegacyGameInterfaceLayer');

export class InterfaceHooks extends GlobalHooks {
    Initialize() {
        ModInterface.register(TrackerInterface);
        ModInterfaceLayer.register(TrackerInterfaceLayer);

        Main['void UpdateUIStates(GameTime gameTime)'].hook((original, self, gameTime) => {
            original(self, gameTime);
            ModInterface.Update();
        });

        LegacyGameInterfaceLayer['bool DrawSelf()'].hook((original, self) => {
            ModInterfaceLayer.SetupInterfaceLayers();

            if (ModInterfaceLayer.isModLayer(self.Name)) {
                ModInterfaceLayer.DrawLayer(self.Name);
                return true;
            }

            return original(self);
        });
    }

    OnWorldUnload() {
        ModInterface.Clear();
    }
}
