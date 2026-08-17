// Asset manifest: every sprite/sound the game uses is resolved through this map.
//
// To use your own art (e.g. sprites rendered from your own FreeSpace 2 install),
// drop files into assets/local/ (gitignored, never pushed) and point an entry's
// url at e.g. 'local/myfighter.png'. No code changes needed.
//
// angleOffset: degrees added to the entity's facing so the art points the right
// way (facing 0 = east). Art drawn pointing up needs 90, pointing left needs 180.

export const IMAGES = {
  player:       { url: 'millionthvector/faction5-spaceships/F5S1.png', angleOffset: 90, scale: 0.35 },
  enemyFighter: { url: 'millionthvector/faction6-spaceships/RD2.png', angleOffset: 90, scale: 0.3 },
  enemyCruiser: { url: 'millionthvector/faction9-spaceships/bluecruiser.png', angleOffset: 180, scale: 1.2 },
  laserPlayer:  { url: 'space-shooter-redux/PNG/Lasers/laserBlue01.png', angleOffset: 90, scale: 0.8 },
  laserEnemy:   { url: 'space-shooter-redux/PNG/Lasers/laserRed05.png', angleOffset: 90, scale: 0.8 },
  spark:        { url: 'space-shooter-redux/PNG/Effects/star1.png' },
  background:   { url: 'space-shooter-redux/Backgrounds/darkPurple.png' },
};

export const SOUNDS = {
  laserPlayer: { url: 'space-shooter-redux/Bonus/sfx_laser1.ogg', volume: 0.25 },
  laserEnemy:  { url: 'space-shooter-redux/Bonus/sfx_laser2.ogg', volume: 0.15 },
  playerHit:   { url: 'space-shooter-redux/Bonus/sfx_shieldDown.ogg', volume: 0.5 },
  explosion:   { url: 'space-shooter-redux/Bonus/sfx_lose.ogg', volume: 0.5 },
  win:         { url: 'space-shooter-redux/Bonus/sfx_twoTone.ogg', volume: 0.6 },
};
