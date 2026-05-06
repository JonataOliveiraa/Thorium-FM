import './Content/Global/_consoleLog.js'

import { RegisterAll } from './Register/RegisterAll.js';
import { SystemLoader } from './TL/Loaders/SystemLoader.js';

RegisterAll();
SystemLoader.OnModLoad();