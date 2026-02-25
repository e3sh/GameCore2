import { GameCore } from '../../src/core/gamecore.js';
import { TitleScene } from './scenes/TitleScene.js';

window.onload = () => {
    // 1. エンジンの初期化
    const engine = new GameCore({
        canvasId: 'gameCanvas',
        screen: [
            { resolution: { w: 320, h: 240 } }, // Layer 0: ゲーム本編
            { resolution: { w: 320, h: 240 } }  // Layer 1: UI
        ],
        viewport: { w: 320, h: 240 },
        viewMode: 'top' // トップビュー
    });

    // キャンバスサイズをスクリプトから強制的に再設定（属性の読み込みミス防止）
    const canvas = document.getElementById("gameCanvas");
    canvas.width = 320;
    canvas.height = 240;

    console.log("Main: Canvas initialized", {
        actualW: canvas.width,
        actualH: canvas.height
    });

    // 2. 入力設定 (CVBase相当の基本入力)
    engine.input.bind('up', 'keyboard', 'ArrowUp');
    engine.input.bind('down', 'keyboard', 'ArrowDown');
    engine.input.bind('left', 'keyboard', 'ArrowLeft');
    engine.input.bind('right', 'keyboard', 'ArrowRight');

    // アクション (CVBaseでは Z or Space)
    engine.input.bind('action1', 'keyboard', 'KeyZ');
    engine.input.bind('action1', 'keyboard', 'Space');
    // ジャンプ (CVBaseでは C)
    engine.input.bind('jump', 'keyboard', 'KeyC');
    // アイテム (CVBaseでは X)
    engine.input.bind('use', 'keyboard', 'KeyX');

    // 3. シーンの登録
    engine.scenes.push(new TitleScene(engine));

    // 4. ゲームループの開始
    engine.run();

    // デバッグ・フルスクリーン用のキーバインド設定
    window.addEventListener('keydown', (e) => {
        if (e.code === 'KeyF') {
            const canvas = document.getElementById('gameCanvas');
            if (!document.fullscreenElement) {
                canvas.requestFullscreen().catch(err => {
                    console.log(`フルスクリーン化エラー: ${err.message}`);
                });
            } else {
                document.exitFullscreen();
            }
        }
    });
};
