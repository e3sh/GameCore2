import { GameCore } from '../../src/core/gamecore.js';
import { Entity } from '../../src/logic/entity/EntityManager.js';
import { SpriteBehavior } from '../04_tilemap_combat/behaviors/SpriteBehavior.js';
import { PhysicsBehavior } from '../../src/logic/entity/PhysicsBehavior.js';
import { Behavior } from '../../src/logic/entity/Behavior.js';

// トップビュー用のプレイヤー操作ビヘイビア
class TopDownPlayerBehavior extends Behavior {
    constructor() {
        super();
        this.speed = 3; // エンジン側で (dt/16) 掛けされるため、1フレームあたりの基準移動ピクセル
        this.jumpForce = 8;
    }

    update(dt) {
        const e = this.entity;
        const input = e.engine.input;

        // X/Y 軸の移動
        e.vx = 0;
        e.vy = 0;

        if (input.isPressed('left')) e.vx = -this.speed;
        if (input.isPressed('right')) e.vx = this.speed;
        if (input.isPressed('up')) e.vy = -this.speed;
        if (input.isPressed('down')) e.vy = this.speed;

        // 斜め移動時の速度正規化
        if (e.vx !== 0 && e.vy !== 0) {
            e.vx *= Math.SQRT1_2;
            e.vy *= Math.SQRT1_2;
        }

        // Z軸ジャンプ (床 z=0 にいる時のみ)
        if (input.isDown('action1') && e.z <= 0) {
            e.vz = this.jumpForce;
        }

        // ジャンプ中のみ影のような演出としてalphaを下げる（擬似）
        const sprite = e.getBehavior('SpriteBehavior');
        if (sprite) {
            if (e.z > 0) {
                sprite.alpha = 200; // ジャンプ中は少し半透明
            } else {
                sprite.alpha = 255;
            }
        }

        // デバッグ表示の更新
        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML = `
                X: ${Math.round(e.x)}, Y: ${Math.round(e.y)}<br>
                Z (Height): ${Math.round(e.z)}<br>
                VZ: ${e.vz.toFixed(1)}
            `;
        }
    }
}

// 簡単な障害物（木など）
class ObstacleBehavior extends Behavior {
    constructor() {
        super();
    }
    onAttach(entity) {
        entity.isSolid = true; // 衝突対象
    }
}

// ダミー画像の生成（アセットマネージャー用）
function createDummyImage(color, width, height) {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, width, height);

    // 枠線
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 2;
    ctx.strokeRect(0, 0, width, height);

    // キャラクターの顔っぽいもの
    if (color !== 'green') {
        ctx.fillStyle = 'black';
        ctx.fillRect(8, 8, 4, 4);
        ctx.fillRect(20, 8, 4, 4);
        ctx.fillRect(12, 18, 8, 2);
    }

    return canvas;
}

// --- メイン初期化 ---
const engine = new GameCore({
    canvasId: 'gameCanvas',
    screen: [
        { resolution: { w: 320, h: 240 } }, // Layer 0: ゲーム画面
        { resolution: { w: 320, h: 240 } }  // Layer 1: UIなど
    ],
    viewport: { w: 320, h: 240 },
    viewMode: 'top' // トップビューモードを有効化
});

// ダミー画像をアセットとして登録
engine.assets.assets.images.set('player', createDummyImage('cyan', 32, 32));
engine.assets.assets.images.set('tree', createDummyImage('green', 32, 48)); // 縦長
engine.assets.assets.images.set('enemy', createDummyImage('red', 32, 32));

window.onload = () => {
    // 入力マッピングの設定
    engine.input.bind('up', 'keyboard', 'ArrowUp');
    engine.input.bind('down', 'keyboard', 'ArrowDown');
    engine.input.bind('left', 'keyboard', 'ArrowLeft');
    engine.input.bind('right', 'keyboard', 'ArrowRight');
    engine.input.bind('action1', 'keyboard', 'Space');

    // プレイヤーエンティティ
    const player = new Entity();
    player.x = 100;
    player.y = 100;
    player.width = 24; // 衝突判定は少し小さく
    player.height = 24;

    player.addBehavior(new SpriteBehavior(engine, 'player', { scale: 1.0, sw: 32, sh: 32 }));
    player.addBehavior(new PhysicsBehavior({ gravity: 0.4, friction: 0.8 }));
    player.addBehavior(new TopDownPlayerBehavior());

    engine.entities.add(player);

    // カメラをプレイヤーに追従させる
    engine.viewport.follow(player);

    // 障害物（木）を複数配置
    const positions = [
        { x: 150, y: 150 },
        { x: 200, y: 100 },
        { x: 80, y: 200 },
        { x: 250, y: 180 },
        { x: 150, y: 50 },
    ];

    positions.forEach(pos => {
        const tree = new Entity();
        tree.x = pos.x;
        tree.y = pos.y;
        tree.width = 32;
        // zOrderはデフォルト0。Yソートにより、Y座標が大きいもの（画面下）が手前に描画される
        // また木なので、当たり判定のY中心を下側にずらすために少しハック等が必要な場合があるが、今回はシンプルに配置
        tree.addBehavior(new SpriteBehavior(engine, 'tree', { scale: 1.0, sw: 32, sh: 48 }));
        tree.addBehavior(new ObstacleBehavior());

        engine.entities.add(tree);
    });

    // うろつく敵（Z判定のすり抜けテスト用）
    const enemy = new Entity();
    enemy.x = 220;
    enemy.y = 130;
    enemy.addBehavior(new SpriteBehavior(engine, 'enemy', { scale: 1.0, sw: 32, sh: 32 }));
    enemy.addBehavior(new ObstacleBehavior()); // 衝突対象

    engine.entities.add(enemy);

    // エンジン起動
    engine.run();

    // デバッグ用: 敵を左右に往復させる簡単な動き
    setInterval(() => {
        enemy.x += Math.sin(Date.now() / 500) * 2;
    }, 16);
};
