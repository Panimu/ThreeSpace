import Phaser from 'phaser';
import { BootScene } from './scenes/BootScene.js';
import { TitleScene } from './scenes/TitleScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { SandboxScene } from './scenes/SandboxScene.js';
import { WikiScene } from './scenes/WikiScene.js';
import { RefitScene } from './scenes/RefitScene.js';
import { AfterActionScene } from './scenes/AfterActionScene.js';
import { CampaignScene } from './scenes/CampaignScene.js';
import { loadRefits } from './refit.js';
import { watchForUpdates } from './update.js';

loadRefits();
// Watches for a new deploy in the background. It only ever raises a flag —
// TitleScene decides when to offer it, so a battle is never interrupted.
watchForUpdates();

window.game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  backgroundColor: '#04040a',
  scale: {
    mode: Phaser.Scale.RESIZE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  physics: {
    default: 'arcade',
  },
  scene: [BootScene, TitleScene, SelectScene, SandboxScene, WikiScene, RefitScene, AfterActionScene, CampaignScene],
});
