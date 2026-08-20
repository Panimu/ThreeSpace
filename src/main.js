import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene.js';
import { SelectScene } from './scenes/SelectScene.js';
import { SandboxScene } from './scenes/SandboxScene.js';
import { WikiScene } from './scenes/WikiScene.js';
import { RefitScene } from './scenes/RefitScene.js';
import { AfterActionScene } from './scenes/AfterActionScene.js';
import { loadRefits } from './refit.js';

loadRefits();

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
  scene: [TitleScene, SelectScene, SandboxScene, WikiScene, RefitScene, AfterActionScene],
});
