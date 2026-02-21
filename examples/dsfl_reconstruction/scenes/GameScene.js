import { BaseScene as Scene } from '../../../src/logic/scene/SceneSystem.js';
import { TitleScene } from './TitleScene.js';
import { Entity } from '../../../src/logic/entity/EntityManager.js';
import { SpriteBehavior } from '../behaviors/SpriteBehavior.js';
import { PhysicsBehavior } from '../../../src/logic/entity/PhysicsBehavior.js';
import { ParticleSystem } from '../../../src/logic/systems/ParticleSystem.js?v=4';
import { UIBehavior } from '../../../src/logic/entity/UIBehavior.js';
import { WindowBehavior } from '../../../src/logic/entity/WindowBehavior.js';
import { TextBehavior } from '../../../src/logic/entity/TextBehavior.js';
import { TypewriterBehavior } from '../../../src/logic/entity/TypewriterBehavior.js';
import { AnimationSystem } from '../../../src/logic/systems/AnimationSystem.js?v=2';
import { MapLoader } from '../../../src/logic/loader/MapLoader.js?v=6';
import { PlayerBehavior } from '../behaviors/PlayerBehavior.js';
import { PlayerAttackBehavior } from '../behaviors/PlayerAttackBehavior.js';
import { SimpleEnemyBehavior } from '../behaviors/SimpleEnemyBehavior.js';

/**
 * @class GameScene
 * @description メインのゲームプレイ画面。
 */
export class GameScene extends Scene {
    constructor(engine) {
        super(engine);
        this.loader = new MapLoader(engine);

        // エンジン全体で共有するパーティクルシステム（デバッグ描画用エンティティとして追加）
        this.particleSystem = new ParticleSystem(engine);
        const particleEntity = new Entity();
        particleEntity.addBehavior(this.particleSystem);
        this.engine.entities.add(particleEntity);
    }

    async init() {
        console.log("GameScene: init started");
        try {
            // マップデータのロード
            console.log("GameScene: loading map1...");
            const mapData = await this.engine.assets.loadJSON('map1', 'test_map.json?v=11');
            console.log("GameScene: map1 loaded", mapData);

            // アニメーションデータ(Aseprite JSON)のロード
            const playerAnimData = await this.engine.assets.loadJSON('playerAnim', 'test_player.json');

            // プレハブの登録 (このタイミングで遅延登録するか、事前にロード済みオブジェクトを参照させる)
            this.loader.registerPrefab('player', () => {
                const e = new Entity();
                e.width = 32; e.height = 32;
                const physics = e.addBehavior(new PhysicsBehavior()); // タイル等と衝突する
                const sprite = e.addBehavior(new SpriteBehavior(this.engine, 'aschr', { sx: 0, sy: 0, sw: 32, sh: 32 }));
                const anim = e.addBehavior(new AnimationSystem());

                // Aseprite JSON からアニメーションを自動構築
                anim.setupFromAseprite(playerAnimData);

                anim.play('idle');

                // プレイヤーの移動・ジャンプ操作を扱うコンポーネント
                e.addBehavior(new PlayerBehavior(this.engine));

                // 攻撃機能コンポーネント
                e.addBehavior(new PlayerAttackBehavior(this.engine));

                return e;
            });

            this.loader.registerPrefab('enemy', (props) => {
                console.log("GameScene: Instantiating Enemy Prefab with props:", props);
                const e = new Entity();
                e.width = 32; e.height = 32;
                e.color = "red";
                e.addBehavior(new PhysicsBehavior());

                // 汎用敵AIコンポーネント
                e.addBehavior(new SimpleEnemyBehavior(this.engine, {
                    hp: 3,
                    speed: 1.0,
                    direction: 1 // 右へ進む
                }));
                return e;
            });

            // 画像アセットのロード
            console.log("GameScene: loading aschr image...");
            await this.engine.assets.loadImage('aschr', 'pict/aschr.png?v=2');
            console.log("GameScene: loading bg1 image...");
            await this.engine.assets.loadImage('bg1', 'pict/bg1.png');
            console.log("GameScene: aschr loaded");

            console.log("GameScene: parsing map layers...");
            // タイル用のダミーパターンを登録（SpriteSystemのフォールバックを発動させるため）
            this.engine.sprite.setPattern(1, { imageKey: 'dummy', frames: [{ x: 0, y: 0, w: 32, h: 32 }] });
            this.loader.load(mapData);

            // プレイヤーを探して追従
            const player = this.engine.entities.entities.find(e => e.tag === 'player');
            if (player) {
                console.log("GameScene: following player");
                this.engine.viewport.follow(player);
            } else {
                console.warn("GameScene: player entity not found! Map may possess errors.");
            }

            // === テスト用UIの配置 ===
            const uiEntity = new Entity();
            uiEntity.x = 20;
            // 画面下部に配置する想定 (DisplayManagerの論理サイズを基準とする。例: 640x480ならば480-120など)
            // このデモの defaultWidth は 640, height: 480 程度と仮定
            uiEntity.y = 300;
            uiEntity.width = 600;
            uiEntity.height = 96;

            // これでカメラの影響を受けずに x=20, y=340 の画面固定描画となる
            uiEntity.addBehavior(new UIBehavior());
            uiEntity.addBehavior(new WindowBehavior({ bgColor: "rgba(0,0,0,0.8)", borderColor: "white", borderWidth: 2 }));

            // TextBehavior
            uiEntity.addBehavior(new TextBehavior({
                font: "20px monospace",
                color: "white",
                paddingX: 10,
                paddingY: 10
            }));

            // TypewriterBehavior (50msごとに1文字出力)
            const typewriter = uiEntity.addBehavior(new TypewriterBehavior(50));

            // type 開始指示
            typewriter.showText("こんにちは！\nGameCore の UIシステムとタイプライター機能の\nテストメッセージです。");

            this.engine.entities.add(uiEntity);

            console.log("GameScene: init SUCCESS");
        } catch (err) {
            console.error("GameScene init FAILED:", err);
        }
    }

    update(dt) {
        // 全体の更新は GameCore が行うが、追加ロジックがあればここで。
    }

    draw(display) {
        // 背景の描画などが必要な場合
    }
}
