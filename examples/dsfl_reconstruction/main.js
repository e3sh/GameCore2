import { GameCore } from '../../src/core/gamecore.js?v=14';
import { TitleScene } from './scenes/TitleScene.js';
import { GameState } from "./logic/GameState.js";

const engine = new GameCore({
    canvasId: "mainCanvas",
    screen: [
        { resolution: { w: 640, h: 400 } }, // Layer 0: ゲーム画面
        { resolution: { w: 640, h: 400 } }  // Layer 1: UI画面
    ]
});

engine.state = new GameState();

// 入力マッピングの基本設定
engine.input.bind('Up', 'keyboard', 'ArrowUp');
engine.input.bind('Down', 'keyboard', 'ArrowDown');
engine.input.bind('Left', 'keyboard', 'ArrowLeft');
engine.input.bind('Right', 'keyboard', 'ArrowRight');
engine.input.bind('Jump', 'keyboard', 'ArrowUp');       // ジャンプ（上キー）
engine.input.bind('Jump', 'keyboard', 'Space');         // ジャンプ（スペースキー）
engine.input.bind('Attack', 'keyboard', 'KeyZ');        // 攻撃（Zキー）
engine.input.bind('Select', 'keyboard', 'Enter');
engine.input.bind('Select', 'keyboard', 'Space');
engine.input.bind('Cancel', 'keyboard', 'Escape');

// マウス左クリックを Select に紐付け
engine.input.bind('Select', 'mouse', 0);

// 初期シーン
import('./scenes/GameScene.js?v=9').then(m => {
    engine.scenes.push(new m.GameScene(engine));
});

window.addEventListener('keydown', (e) => {
    // 開発用バイパスキー
});

const startButton = document.getElementById('startButton');
const overlay = document.getElementById('overlay');

startButton.addEventListener('click', () => {
    startButton.blur();
    engine.sound.resume();
    overlay.style.opacity = '0';
    setTimeout(() => {
        overlay.style.display = 'none';
        engine.run();
    }, 500);
});
