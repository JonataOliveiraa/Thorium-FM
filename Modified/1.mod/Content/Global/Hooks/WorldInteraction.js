import { GlobalHooks } from "../../../TL/GlobalHooks.js";
import { Terraria } from "../../../TL/ModImports.js";
import { AquaticDepths } from "../../Biomes/AquaticDepths.js";
import { ScarletChestStructure } from "../../Structures/ScarletChestStructure.js";
import { BloodChamberStructure } from "../../Structures/BloodChamberStructure.js";
import { ChestInjection } from "./ChestInjection.js";
import { NaturalGraveyard } from "../../Biomes/NaturalGraveyard.js";

const { WorldGen } = Terraria;

export class WorldInteraction extends GlobalHooks {
    Initialize() {
        WorldGen.ShimmerCleanUp.hook((original, self) => {
            original(self);

            new ScarletChestStructure().Generate();
            new BloodChamberStructure().Generate();
            new AquaticDepths().Generate();
            new NaturalGraveyard().Generate();
            new ChestInjection().Inject();
        });
    }
}