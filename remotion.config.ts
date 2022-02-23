import {Config} from 'remotion';

Config.Rendering.setImageFormat('jpeg');
Config.Output.setOverwriteOutput(true);
Config.Puppeteer.setTimeoutInMilliseconds(1200000);
Config.Puppeteer.setBrowserExecutable("/Applications/Google Chrome.app/Contents/MacOS/Google Chrome");
