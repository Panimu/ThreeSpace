import Phaser from 'phaser';
import { TitleScene } from './scenes/TitleScene.js';
import { SandboxScene } from './scenes/SandboxScene.js';
import { WikiScene } from './scenes/WikiScene.js';

new Phaser.Game({
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
  scene: [TitleScene, SandboxScene, WikiScene],
});
