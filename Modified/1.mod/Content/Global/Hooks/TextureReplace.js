import { ModSystem } from "../../../TL/ModSystem.js";
import { Terraria } from '../../../TL/ModImports.js';
import { ThoriumOreTile } from "../Tiles/ThoriumOreTile.js";
import { LifeQuartzTile } from "../Tiles/LifeQuartzTile.js";
import { ThoriumAnvil } from "../Tiles/ThoriumAnvil.js";
import { LeakyMarineBlock } from "../Tiles/LeakyMarineBlock.js";
import { LeakyMarineWall } from "../Walls/LeakyMarineWall.js";
import { MossyGoldOreTile } from "../Tiles/MossyGoldOreTile.js";
import { MossyPlatinumOreTile } from "../Tiles/MossyPlatinumOreTile.js";
import { AquaiteTile } from "../Tiles/AquaiteTile.js";
import { AquamarineTile } from "../Tiles/AquamarineTile.js";
import { DepthSatagmites } from "../Tiles/DepthSatagmites.js";
import { MarineBolders } from "../Tiles/MarineBolders.js";
import { ArcaneArmorFabricator } from "../Tiles/ArcaneArmorFabricator.js";
import { ScarletTile } from "../Tiles/ScarletTile.js";
import { Containers2 } from "../Tiles/Containers2.js";
import { BloodAltar } from "../Tiles/BloodAltar.js";
import { LifeShieldPlayer } from "../LifeShieldPlayer.js";
import { ModTexture } from "../../../TL/ModTexture.js";
import { LeakyMossyMarineBlock } from "../Tiles/LeakyMossyMarineBlock.js";
import { OpalTile } from "../Tiles/OpalTile.js";
import { DepthsAquamarineTile } from "../Tiles/DepthsAquamarineTile.js";
import { BardEmblem } from "../Items/BardEmblem.js";
import { ClericEmblem } from "../Items/ClericEmblem.js";
import { ModHealerItem } from "../../../Common/ModHealerItem.js";
import { ModItem } from "../../../TL/ModItem.js";
import { GrimAstroturf } from "../Tiles/GrimAstroturf.js";
import { AncientPhylactery } from "../Tiles/AncientPhylactery.js";
import { MarkedGrave } from "../Tiles/MarkedGrave.js";
import { SmoothCoal } from "../Tiles/SmoothCoal.js";

export class TextureReplace extends ModSystem {
  constructor() {
    super()
  }

  static _CustomTextures = new Map()

  SetupContent() {
    // const SystemArray = new NativeClass('System', 'Array');
    // const ObjectType = new NativeClass('System', 'Type')['Type GetType(string typeName)']('System.Object');
    // const CreateInstance = SystemArray['Array CreateInstance(Type elementType, int length)'];
    // const SetValue = SystemArray['void SetValue(object value, int index)'];
    // const AndroidJavaObject = new NativeClass('UnityEngine', 'AndroidJavaObject');

    // function tocarAudioNativo(caminhoAbsoluto) {
    //   try {
    //     const mediaPlayer = AndroidJavaObject.new();
    //     const construtorJavaObj = AndroidJavaObject['void .ctor(string className, object[] args)'];
    //     const argsConstrutorJava = CreateInstance(ObjectType, 0);
    //     construtorJavaObj(mediaPlayer, 'android.media.MediaPlayer', argsConstrutorJava);
    //     const CallVoid = AndroidJavaObject['void Call(string methodName, object[] args)'];
    //     const argsSetDataSource = CreateInstance(ObjectType, 1);
    //     SetValue(argsSetDataSource, NativeObject.wrap(caminhoAbsoluto, 'string'), 0);
    //     CallVoid(mediaPlayer, 'setDataSource', argsSetDataSource);
    //     const argsVazios = CreateInstance(ObjectType, 0);
    //     CallVoid(mediaPlayer, 'prepare', argsVazios);
    //     CallVoid(mediaPlayer, 'start', argsVazios);
    //   } catch (e) {
    //   }
    // }

    // const pathMod = tl.mod.path;
    // const meuCaminho = pathMod + '/test.wav';

    // tl.log("Tentando reproduzir arquivo em: " + meuCaminho);
    // tocarAudioNativo(meuCaminho);

    Containers2.InjectTexture()

    ThoriumOreTile.InjectTexture()
    LifeQuartzTile.InjectTexture()
    ThoriumAnvil.InjectTexture()

    LeakyMarineBlock.InjectTexture()
    LeakyMossyMarineBlock.InjectTexture()
    LeakyMarineWall.InjectTexture()
    MossyGoldOreTile.InjectTexture()
    MossyPlatinumOreTile.InjectTexture()
    AquaiteTile.InjectTexture()
    AquamarineTile.InjectTexture()
    DepthsAquamarineTile.InjectTexture()
    OpalTile.InjectTexture()
    DepthSatagmites.InjectTexture()
    MarineBolders.InjectTexture()

    ArcaneArmorFabricator.InjectTexture()
    BloodAltar.InjectTexture()
    AncientPhylactery.InjectTexture()
    MarkedGrave.InjectTexture()

    ScarletTile.InjectTexture()
    Containers2.InjectTexture()

    BardEmblem.InjectTexture()
    ClericEmblem.InjectTexture()
    GrimAstroturf.InjectTexture()
    SmoothCoal.InjectTexture()
  }

  PostSetupContent() {
    LifeShieldPlayer.SaveDefaultTextures()
    LifeShieldPlayer.LoadTextures()

    //Loading Items Type
    ModHealerItem.healerItemsName = new Set([...ModHealerItem.healerItemsName].map(str => ModItem.getTypeByName(str)))
  }
}

