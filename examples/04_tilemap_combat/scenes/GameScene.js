import { BaseScene as Scene } from '../../../src/logic/scene/SceneSystem.js';
import { TitleScene } from './TitleScene.js';
import { EndingScene } from './EndingScene.js';
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
import { HUDBehavior } from '../behaviors/HUDBehavior.js';
import { TilemapRendererBehavior } from '../behaviors/TilemapRendererBehavior.js';
import { GridCollisionBehavior } from '../behaviors/GridCollisionBehavior.js';

/**
 * @class GameScene
 * @description メインのゲームプレイ画面。
 */
export class GameScene extends Scene {
    constructor(engine) {
        super(engine);
        this.loader = new MapLoader(engine);
    }

    async init() {
        console.log("GameScene: init started");
        // 以前のセッションのエンティティを確実にクリアする
        this.engine.entities.clear();

        // パーティクルシステムの初期化（リスタートごとに新しく作成）
        this.particleSystem = new ParticleSystem(this.engine);
        const particleEntity = new Entity();
        particleEntity.addBehavior(this.particleSystem);
        this.engine.entities.add(particleEntity);

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
                e.addBehavior(new GridCollisionBehavior()); // グリッド衝突を追加
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
                e.addBehavior(new GridCollisionBehavior()); // 敵にも追加

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
            // 背景描画と衝突用のBehaviorを登録
            this.loader.registerBehavior('TilemapRendererBehavior', TilemapRendererBehavior);

            // タイル用のダミーパターンを登録（SpriteSystemのフォールバックを発動させるため）
            this.engine.sprite.setPattern(1, { imageKey: 'dummy', frames: [{ x: 0, y: 0, w: 32, h: 32 }] });
            this.loader.load(mapData);

            // もしマップに "Collision" レイヤがない場合、"background" レイヤを代わりに使う
            if (!this.engine.collisionMap) {
                const bgLayer = mapData.layers.find(l => l.name === 'background');
                if (bgLayer) this.engine.collisionMap = bgLayer;
            }

            // プレイヤーを探して追従
            const player = this.engine.entities.entities.find(e => e.tag === 'player');
            if (player) {
                console.log("GameScene: following player");
                this.engine.viewport.follow(player);
                // 明示的に画面サイズと追従オフセットを設定
                this.engine.viewport.width = 640;
                this.engine.viewport.height = 400;
                this.engine.viewport.targetOffsetY = 0; // 中央
                this.engine.viewport.damping = 0.2; // 少し速めに追従
            } else {
                console.warn("GameScene: player entity not found! Map may possess errors.");
            }

            // === HUDの配置 ===
            const hudEntity = new Entity();
            hudEntity.addBehavior(new HUDBehavior(this.engine));
            this.engine.entities.add(hudEntity);

            console.log("GameScene: init SUCCESS");
        } catch (err) {
            console.error("GameScene init FAILED:", err);
        }
    }

    update(dt) {
        // 全ての敵が全滅したか判定
        const enemies = this.engine.entities.entities.filter(e => e.getBehavior('SimpleEnemyBehavior'));

        // MapLoaderでの生成が終わるのを待つため、初回に敵を発見してから判定を開始する
        if (enemies.length > 0) {
            this._enemiesFound = true;
        }

        if (this._enemiesFound) {
            const allDead = enemies.every(e => !e.alive);
            if (allDead) {
                console.log("Mission Accomplished! All enemies defeated.");
                this.engine.scenes.replace(new EndingScene(this.engine));
            }
        }
    }

    draw(display) {
        // 背景の描画などが必要な場合
    }
}
