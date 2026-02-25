import { BaseScene } from '../../../src/logic/scene/SceneSystem.js';
import { Entity } from '../../../src/logic/entity/EntityManager.js';
import { SpriteBehavior } from '../behaviors/SpriteBehavior.js';
import { PhysicsBehavior } from '../../../src/logic/entity/PhysicsBehavior.js';
import { PlayerControlBehavior } from '../behaviors/PlayerControlBehavior.js';
import { SpriteDataLoader } from '../assets/SpriteDataLoader.js';
import { PlayerAnimationBehavior } from '../behaviors/PlayerAnimationBehavior.js';
import { LevelBuilder } from './LevelBuilder.js';
import { DebugHitboxBehavior } from '../behaviors/DebugHitboxBehavior.js';
import { TargetTrackingBehavior } from '../behaviors/TargetTrackingBehavior.js';
import { PlayerCombatBehavior } from '../behaviors/PlayerCombatBehavior.js';
import { HUDBehavior } from '../behaviors/HUDBehavior.js';
import { PlayerInventoryBehavior } from '../behaviors/PlayerInventoryBehavior.js';
import { ItemDropBehavior } from '../behaviors/ItemDropBehavior.js';
import { PatrolBehavior } from '../behaviors/PatrolBehavior.js';
import { StateMachineBehavior } from '../behaviors/StateMachineBehavior.js';
import { MapLoader } from '../../../src/logic/loader/MapLoader.js';
import { EntityFactory } from './EntityFactory.js';
import { DungeonGenerator } from './DungeonGenerator.js';
import { ParticleSystem } from '../../../src/logic/systems/ParticleSystem.js';

export class GameScene extends BaseScene {
    constructor(engine) {
        super(engine);
    }

    async init() {
        console.log("GameScene initialized.");

        // 前シーンのエンティティをすべてクリアする
        this.engine.entities.clear();
        this.engine.sprite.clear();
        this.engine.particles.clear();

        // 1. 本番アセットのロードと登録
        await this.engine.assets.loadImage('cha', './assets/cha.png');
        await this.engine.assets.loadImage('bg1', './assets/bg1.png');

        // SpriteSystem へのパターン登録
        SpriteDataLoader.loadSpData(this.engine);
        SpriteDataLoader.loadBgData(this.engine);

        // 2. マップデータとエンティティのロード
        if (!this.engine.globalState) {
            this.engine.globalState = { stageno: 1 };
        } else if (!this.engine.globalState.stageno) {
            this.engine.globalState.stageno = 1;
        }

        // パーティクルシステムの初期化と登録
        const particleEntity = new Entity(this.engine);
        particleEntity.zOrder = 1000; // 前面に描画するため
        // engine.particles を既に持っているので、それをEntityのBehaviorとしても使えるようにするか、
        // あるいは単に engine.particles をそのまま使う。
        // ここでは behavior として追加しておく（互換性のため）
        particleEntity.addBehavior(this.engine.particles);
        this.engine.entities.add(particleEntity);
        // engine.particleSystem としても参照できるようにしておく（PortalBehavior等のため）
        this.engine.particleSystem = this.engine.particles;

        const generator = new DungeonGenerator();
        const mapData = generator.generate(this.engine.globalState.stageno);

        const mapLoader = new MapLoader(this.engine);
        EntityFactory.registerPrefabs(this.engine, mapLoader);
        mapLoader.load(mapData);

        // 3. プレイヤーの取得 (カメラ追従のため)
        const player = this.engine.entities.entities.find(e => e.getBehavior('PlayerControlBehavior'));
        if (player) {
            // カメラの追従
            this.engine.viewport.follow(player);
            this.engine.viewport.targetOffsetY = 0; // 垂直中央に配置

            // 4. Tracker等の対応 (プレイヤーをターゲットにする等)
            this.engine.entities.entities.forEach(e => {
                const tracker = e.getBehavior('TargetTrackingBehavior');
                if (tracker && !tracker.target) {
                    tracker.target = player;
                }
            });
        } else {
            console.warn("Player entity not found in map data.");
        }

        const debugInfo = document.getElementById('debugInfo');
        if (debugInfo) {
            debugInfo.innerHTML = "GameScene Loaded<br>Arrow Keys: Move<br>Z/Space: Attack, C: Jump<br>F: Fullscreen";
        }

        // BGMの再生開始 (BeepcoreのMMLでシンプルなループを生成)
        // ※音声ファイル(MP3/WAV)をBGMとして再生する場合は以下のように記述します:
        // const bgmBuffer = this.engine.assets.getSound('bgm_asset_name');
        // if (bgmBuffer) this.engine.sound.playBGM(bgmBuffer, true); // trueでループ再生

        if (this.engine.sound) {
            const bgmMML = "T150 V8 O4 L8 C E G E A C E C F A C A G B D B ";
            // interval=0.125 (8分音符相当) でループ再生 (※今回はBeepcoreのplayScoreのみで、厳密なループ再生は簡略化して単発長め再生とするか、複数回指定)
            // GameCoreのBeepcoreは自動ループ機能がないため、とりあえず長めに繋げるか、そのまま鳴らします。
            this.engine.sound.playScore(bgmMML + bgmMML + bgmMML + bgmMML, 0.125 * 1000, performance.now());
        }
    }

    update(dt) {
        super.update(dt);
        // シーン固有の更新処理
    }
}
