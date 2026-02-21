# GameCore2 API 詳細リファレンス

このドキュメントでは、GameCore2エンジンの主要構成モジュールに含まれるクラスと、そのプロパティ・メソッドに関する詳細なリファレンス情報を提供します。

---

## 目次
1. [Coreモジュール](#coreモジュール)
    - [GameCore](#gamecore)
    - [DisplayManager (及び Layer)](#displaymanager-及び-layer)
    - [SpriteSystem](#spritesystem)
    - [InputDevices](#inputdevices)
    - [AudioManager](#audiomanager)
    - [AssetManager](#assetmanager)
2. [Logicモジュール](#logicモジュール)
    - [Entity](#entity)
    - [Behavior](#behavior)
    - [EntityManager](#entitymanager)
    - [CollisionSystem](#collisionsystem)
    - [SceneNavigator (及び BaseScene)](#scenenavigator-及び-basescene)

---

## Coreモジュール

### GameCore
エンジンの統合エントリクラス。表示、入力、音声、アセット、エンティティ、シーンなどの主要システムを統括します。
- `constructor(sysParam)`
    - `sysParam.canvasId` (string): メインキャンバスのHTML要素ID
    - `sysParam.screen` (Array): 各レイヤーの解像度設定の配列（例: `[{resolution: {w:640, h:480}}]`）
    - `sysParam.viewport` (Object): カメラのサイズ設定（省略時は 640x480）
- `run()`: ゲームループを開始します。
- `stop()`: ゲームループを停止します。
- `update()`: （内部呼び出し）エンジン内の全システムの状態を更新します。
- `draw()`: （内部呼び出し）エンジン内の全システムの描画処理を行います。

### DisplayManager 及び Layer
複数の描画レイヤーを管理し、メインキャンバスへ合成・転送するクラス。
- `constructor(canvasId, screenParams)`
- `getLayer(index)`: 指定したインデックスのレイヤー（`Layer` クラス）を取得します。
- `clearAll()`: 全てのレイヤーをクリアします。
- `present()`: 全てのレイヤーを順番にメインキャンバスへ合成描画します。

#### Layer
個別の描画レイヤー（OffscreenCanvas）を管理するクラス。
- `clear()`: レイヤー全体をクリアします。
- `fill(color)`: レイヤー全体を指定した色で塗りつぶします。
- `drawImg(img, sx, sy, sw, sh, dx, dy, dw, dh)`: 簡易的な画像描画（トリミング・リサイズ可能）を行います。
- `spPut(img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r)`: 回転、反転、アルファ値などを含む高度なスプライト描画を行います。

### SpriteSystem
登録されたアニメーションパターンに基づき、大量の軽量スプライトを表示・管理するシステム。
- `setPattern(id, param)`: スプライトパターンの設定を行います。`param` には `imageKey` や `frames` の配列を指定します。
- `createItem(patternId, x = 0, y = 0)`: 新しいスプライトアイテムを作成してシステムに登録します。戻り値は `SpriteItem` オブジェクト。
- `update(dt)` / `draw(display, viewport)`: 全スプライトの更新と描画を行います。

### InputDevices
全ての物理入力デバイス（キーボード、マウス、ゲームパッド）を統括するクラス。
- `keyboard.isPressed(code)`: 指定されたキー（例: "Space"）が現在押されているかを返します。
- `mouse.isPressed(button)`: 指定されたマウスボタン（0: 左, 1: 中, 2: 右）が押されているかを返します。
- `mouse.dx` / `mouse.dy`: 毎フレームごとのマウスの移動量です。
- `gamepad.isButtonPressed(buttonIndex, gpadIndex=0)`: 指定したゲームパッドボタンが押されているかを返します。
- `gamepad.getAxis(axisIndex, gpadIndex=0)`: アナログスティックの入力値（-1.0〜1.0）を取得します。

### AudioManager
シンセサイザー(Beepcore)とサンプリング音源(MP3/WAV)を統合して管理するクラス。
- `resume()`: ブラウザの制限により停止しているAudioContextを再開します。
- `playScore(namelist, interval, now)`: Beepcoreを使用してメロディを再生します。
- `playSE(buffer, vol=1.0)`: サンプリング音源（効果音）を再生します。同時再生可能です。
- `playBGM(buffer, loop=true)`: サンプリング音源（BGM）を再生します。現在再生中のBGMは自動停止します。
- `stopBGM()`: 現在再生中のBGMを停止します。
- `setMasterVolume(vol)`: 全体のマスターボリュームを設定します。

### AssetManager
画像、音声、JSONなどのゲームアセットを非同期でロード・管理・キャッシュするクラス。
- `loadImage(key, src)`: 画像アセットを非同期で読み込みます（戻り値: `Promise<HTMLImageElement>`）。
- `loadJSON(key, src)`: JSONファイルを非同期で読み込みます（戻り値: `Promise<Object>`）。
- `loadAudio(key, src, audioCtx)`: 音声ファイルを読み込み、AudioBufferとしてデコードします（戻り値: `Promise<AudioBuffer>`）。
- `getImage(key)` / `getSound(key)` / `getData(key)`: 登録した ID に対して読み込み済みのアセットを即座に取得します。
- `get progress`: アセットの読み込み進捗率（0.0〜1.0）を取得します。
- `isDone()`: 全てのアセットの読み込みが完了しているかを返します。

---

## Logicモジュール

### Entity
全てのゲームオブジェクトの基底クラス。コンポーネント（Behavior）を追加することで機能が拡張されます。
- `x`, `y`, `vx`, `vy`: エンティティの座標および速度。
- `width`, `height`: 当たり判定などに利用されるサイズ。
- `addBehavior(behavior)`: コンポーネントを追加します。
- `getBehavior(className)`: 指定したクラス名（例: "SpriteBehavior"）の最初の Behavior を取得します。
- `getBehaviors(className)`: 指定したクラス名の全ての Behavior を配列で取得します。
- `update(dt)`: 全Behaviorの `update` を実行し、速度に基づいて座標を更新します。
- `onCollision(other, colData)`: 衝突時に全てのBehaviorへイベントを伝播させます。

### Behavior
Entity に付与可能な独立した挙動（コンポーネント）の基底クラスです。開発者はこれを継承して新しい機能を作成します。
- `onAttach(entity)`: Entityにアタッチされた際に呼ばれるフック。
- `onDetach()`: Entityからデタッチされる際に呼ばれるフック。
- `update(dt)`: 毎フレーム呼ばれるメインループ。
- `onCollision(other, colData)`: Entity同士が衝突した際に呼ばれるイベント。`colData` には `overlapX` や `overlapY` などのめり込み量が入ります。

### EntityManager
エンティティの生成、更新、描画をライフサイクルとして管理するコンテナクラス。
- `add(entity)`: 新しいEntityを追加し、衝突判定システムにも登録します。
- `update(dt)`: 全てのEntityの更新と衝突判定処理を実行します。死んだエンティティ（`alive = false`）はここで破棄されます。
- `draw(display, viewport)`: 全てのEntityの描画メソッドを呼び出します（各 Behavior に描画が委譲されます）。

### CollisionSystem
AABBベースのエンティティ間の衝突判定を管理・実行するシステム。
- `register(entity)` / `unregister(entity)`: 衝突判定の対象を追加/解除します。
- `checkCollisions()`: 総当たりで矩形の重なり（AABB）を判定します。重なりがある場合は、お互いの `onCollision` イベントを発火させます。

### SceneNavigator 及び BaseScene
スタックベースのシーン管理（画面遷移）を行うクラス。
- `current`: 現在アクティブな最前面シーンを取得します。
- `push(scene)`: 新しいシーンを上に重ね、アクティブにします。裏のシーンは一時停止状態になります（ポーズ画面などに利用します）。
- `pop()`: 今のシーンを破棄し、下のシーンを再びアクティブに戻します。
- `replace(scene)`: 現在のシーンを破棄して、新しいシーンと入れ替えます（通常の画面遷移に利用します）。

#### BaseScene
全てのシーン（画面状態）の親玉であり、継承してオーバーライドします。
- `init()`: シーン作成後、初期化のために呼ばれます。
- `update(dt)` / `draw(display)`: メインループ用メソッド。
- `onEnter()`: アクティブ画面になった際に呼ばれます。
- `onExit()`: 次の画面が載ったり閉じられたりして、非アクティブになる際に呼ばれます。

---

## 3. 一般的なゲーム実装とレイヤー構成（スケルトン）

GameCore2を用いた一般的なゲーム（例えば背景、キャラクター、UIを分けて描画し、タイトル画面からメインゲーム画面に遷移する構成）の実装の流れと、基本となるスケルトンコードの例です。

### レイヤー（OffscreenCanvas）の分割手法

`DisplayManager` は初期化時に複数の仮想画面（レイヤー）を生成できます。
一般的に、以下のように役割を分離すると描画の管理がしやすくなります。
- **Layer 0 (最背面)**: 背景やマップの描画用。
- **Layer 1 (中間層)**: Entityのキャラクタやスプライト（エフェクト等）の描画用。
- **Layer 2 (最前面)**: UI（スコアやボタンなど）の描画用。

### 実装スケルトン例

```javascript
import { GameCore } from './src/core/gamecore.js';
import { BaseScene } from './src/logic/scene/SceneSystem.js';
import { Entity } from './src/logic/entity/EntityManager.js';
import { MapLoader } from './src/logic/loader/MapLoader.js';
import { AnimationSystem } from './src/logic/systems/AnimationSystem.js';

// ----------------------------------------------------
// 1. キャラクター（Entity）と アニメーションの定義
// ----------------------------------------------------

class PlayerEntity extends Entity {
    constructor(x, y) {
        super();
        this.x = x;
        this.y = y;
        this.width = 32;
        this.height = 32;

        // 【モダンな実装】 描画などを Entity に直接書かず、Behavior（コンポーネント）に委ねる
        // （事前にAseprite等からエクスポートしたJSONをAssetManagerで読み込んでいるとします）
        const animSys = new AnimationSystem();
        this.addBehavior(animSys);
        
        // （※実際には、SpriteBehavior もセットで持たせることで自動描画されます）
    }

    // init メソッドなどを設け、ロード完了後に呼ばれるようにするとキレイです
    setupAnimation(asepriteJson) {
        const animSys = this.getBehavior('AnimationSystem');
        // Aseprite の JSON データをそのまま渡すだけで、全アニメーションタグが自動登録される
        animSys.setupFromAseprite(asepriteJson);
        animSys.play('walk'); // 初期アニメーションの再生
    }
}

// ----------------------------------------------------
// 2. メインゲーム画面（シーン）と MapLoader の活用
// ----------------------------------------------------

class MainGameScene extends BaseScene {
    init() {
        // Tiled Map Editor 等で作成したマップデータを一括ロードする
        this.mapLoader = new MapLoader(this.engine);
        
        // プレハブ（オブジェクト名と生成関数の紐付け）を登録
        this.mapLoader.registerPrefab('Player', (props) => new PlayerEntity(0, 0));
        
        // アセットマネージャーからマップのJSONデータを取得してパース
        // （あらかじめ TitleScene等で AssetManager 経由でロード済とする）
        const mapData = this.engine.assets.getData('stage_1_data');
        
        // loader.load を呼ぶだけで、背景タイルの SpriteSystem への自動登録と、
        // コリジョン壁の生成、配置された 'Player' エンティティの生成と EntityManager への追加が全て完了する
        if (mapData) {
            this.mapLoader.load(mapData);
        }

        // 生成された PlayerEntity を探してアニメーションのセットアップをする
        const player = this.engine.entities.entities.find(e => e instanceof PlayerEntity);
        if (player) {
            const playerAsepriteData = this.engine.assets.getData('player_anim');
            player.setupAnimation(playerAsepriteData);
        }
    }

    update(dt) {
        // 全エンティティ（自機・敵・ギミック）の更新と当たり判定
        this.engine.entities.update(dt);
        
        // アニメーション用スプライトの更新（AnimationSystem によって切り替わったコマが反映される）
        this.engine.sprite.update(dt);
    }

    draw(display) {
        // 【モダンな描画】 複雑な直接描画 (fillRect等) は避け、
        // 全て SpriteSystem と、各 Behavior に登録された描画ロジックに任せる

        const bgLayer = display.getLayer(0);    // 背景 (マップタイル)
        const charaLayer = display.getLayer(1); // キャラ
        
        bgLayer.clear();
        charaLayer.clear();

        // SpriteSystem に登録された背景・エフェクトを一斉描画
        this.engine.sprite.draw(display, null);
        
        // EntityManager の管理下にあるエンティティ群を描画
        // （各エンティティの SpriteBehavior 等が charaLayer に自分自身を描き込む）
        this.engine.entities.draw(display, null);
    }
}

// ----------------------------------------------------
// 3. エンジンの初期化と起動
// ----------------------------------------------------

window.addEventListener('load', () => {
    // レイヤー構成（背景、キャラ）
    const sysParam = {
        canvasId: 'gameCanvas',
        screen: [
            { resolution: { w: 640, h: 480 } },
            { resolution: { w: 640, h: 480 } }
        ],
        viewport: { x: 0, y: 0, w: 640, h: 480 }
    };

    const engine = new GameCore(sysParam);
    
    // 【補足】 実際はここでタイトル画面を挟んで assets のロード待ちをする
    engine.scenes.push(new MainGameScene(engine));

    engine.run();
});
```

### 便利機能を活用した開発のポイント

1. **MapLoader によるレイアウトの自動化**  
   ベタ書きで座標を指定して `PlayerEntity` や `EnemyEntity` を `new` していくのは旧来のゴリゴリとした実装方法です。
   GameCore2 では `MapLoader` を使用することで、**Tiled Map Editor** などで作った JSON データから、背景タイル（`SpriteSystem`）や見えない壁の当たり判定（`CollisionSystem`）、キャラクターのプレハブ配置（`EntityManager`）までを全て `load()` の一行で自動展開させることができます。
2. **AnimationSystem によるアニメーション生成の自動化**  
   キャラクターのアニメーションコマを配列で手書きする必要はありません。
   `AnimationSystem` の `setupFromAseprite()` に、ドット絵ツール（Aseprite）からエクスポートした JSON データを渡すだけで、"walk" や "attack" といったタグ名ごとのループアニメーションが全て自動で紐付けられ、利用可能になります。
3. **Behaviorベースのコンポーネント指向 (ECS)**  
   重力・移動処理 (`PhysicsBehavior`) やパーティクル (`ParticleSystem`) など、頻繁に利用する機能を `Entity` に `addBehavior()` するだけで拡張できるように設計されています。これにより、各クラスの中で状態管理や毎フレームの計算を直接書く手間を大幅に削減できます。詳細は次のセクションをご参照ください。

---

## 4. コンポーネント指向 (ECS) での Behavior 活用ユースケース

GameCore2のEntityシステムは **「単なる箱（Entity）に、ふるまい（Behavior/コンポーネント）を取り付けることでキャラクターを作り上げる」** という ECS (Entity-Component-System) の考え方を採用しています。

旧来のシステムのように「Playerクラスに歩く処理も、ジャンプも、描画も、HP計算も全て詰め込む」のではなく、**「機能ごとに細かく分けたBehaviorをレゴブロックのように組み合わせる」** のがモダンなアプローチです。

以下に、よくある Behavior の作成と組み合わせ方のユースケースを紹介します。

### ユースケース 1: 「重力とジャンプ」をコンポーネント化する
自機でも敵キャラでもアイテムでも、「空中に投げたら落下する」という処理は共通です。これを一つの汎用 Behavior として独立させます。

```javascript
import { Behavior } from './src/logic/entity/Behavior.js';

// 重力・ジャンプ処理専用のコンポーネント
class GravityBehavior extends Behavior {
    constructor(gravity = 0.5, jumpPower = -10) {
        super();
        this.gravity = gravity;
        this.jumpPower = jumpPower;
    }

    update(dt) {
        // 所属するEntityのY速度に重力を加算
        this.entity.vy += this.gravity * (dt/16);
    }

    jump() {
        // 地面にいる判定などは省略（実際には接地判定等が必要）
        this.entity.vy = this.jumpPower;
    }
}
```

### ユースケース 2: 「入力受付」をコンポーネント化する
キーボード操作を受け付けて、移動やアクションに変換する処理だけを分けたコンポーネントです。

```javascript
class PlayerInputBehavior extends Behavior {
    constructor(engine) {
        super();
        this.engine = engine; // 入力取得のためにEngineの参照を保持
        this.speed = 5;
    }

    update(dt) {
        const input = this.engine.inputRaw.keyboard;
        
        // 左右キーでX速度を更新
        if (input.isPressed('ArrowRight')) {
            this.entity.vx = this.speed;
        } else if (input.isPressed('ArrowLeft')) {
            this.entity.vx = -this.speed;
        } else {
            this.entity.vx = 0;
        }

        // Spaceキーで、別のコンポーネント（GravityBehavior）のjump機能を呼び出す
        if (input.isPressed('Space')) {
            const gravityComp = this.entity.getBehavior('GravityBehavior');
            if (gravityComp) {
                gravityComp.jump();
            }
        }
    }
}
```

### 実際の組み立て（プレハブ）
上記の独立したコンポーネント（Behavior）を、必要に応じて一つの Entity （箱）にアタッチしていくことで、最終的な「プレイヤーキャラクター」が完成します。

```javascript
// Entity本体は基本的に何もせず、ただの容器として振る舞う
const playerEntity = new Entity();
playerEntity.x = 100;
playerEntity.y = 100;

// 【1. 描画コンポーネント】 アニメーション表示能力を与える
playerEntity.addBehavior(new AnimationSystem());

// 【2. 重力コンポーネント】 落下とジャンプ能力を与える
playerEntity.addBehavior(new GravityBehavior(0.8, -12));

// 【3. 入力コンポーネント】 プレイヤーのキー操作受付能力を与える
playerEntity.addBehavior(new PlayerInputBehavior(this.engine));

// (※もし、敵キャラクターを作りたい場合は)
const enemyEntity = new Entity();
enemyEntity.addBehavior(new AnimationSystem());
enemyEntity.addBehavior(new GravityBehavior(0.8, 0)); // 敵も落下するように同じのを取り付ける
enemyEntity.addBehavior(new EnemyAIBehavior());       // キー操作の代わりにAIコンポーネントを取り付ける
```

このように作成することで、以下のような大きなメリット（ECSの利点）が得られます。

### ユースケース 3: コンポーネントの無効化（状態異常や効果切れ）
特定のコンポーネントの処理を一時的に止めたい（あるいはもう使わない）場合は、Behaviorが標準で持っている `enabled` プロパティを `false` に切り替えます。ゲームエンジン側からの `removeBehavior` は用意されていないため、このフラグでON/OFFを切り替えるのが基本方針となります。

```javascript
// プレイヤーが麻痺した！キーボード操作を無効化する
const inputComp = playerEntity.getBehavior('PlayerInputBehavior');
if (inputComp) {
    inputComp.enabled = false; // これにより update() が呼ばれなくなる
}

// 5秒後に麻痺から回復して再び操作可能になる
setTimeout(() => {
    if (inputComp) inputComp.enabled = true;
}, 5000);
```

### ユースケース 4: Entity同士が影響を与え合う処理（衝突とダメージ）
Entity同士が相互作用する（例えば、プレイヤーの攻撃が敵に当たってHPを減らす）場合、直接お互いのクラス操作をするのではなく、**「相手が持っているBehaviorを探して、その機能を呼び出す（あるいは数値を書き換える）」** 実装になります。

以下は、「HP管理コンポーネント」と、「ぶつかった相手にダメージを与える弾丸コンポーネント」の組み合わせ例です。

```javascript
// 【体力管理コンポーネント】
class HpBehavior extends Behavior {
    constructor(maxHp) {
        super();
        this.hp = maxHp;
    }

    damage(amount) {
        this.hp -= amount;
        if (this.hp <= 0) {
            // HPが0になったらEntityごと死亡（システム側で自動削除される）
            this.entity.alive = false; 
        }
    }
}

// 【弾丸コンポーネント】
class BulletBehavior extends Behavior {
    constructor(power) {
        super();
        this.power = power;
    }

    // 衝突判定システムから自動で呼び出される
    onCollision(other, colData) {
        // ぶつかった相手(other)が HpBehavior を持っているかを確認
        const targetHp = other.getBehavior('HpBehavior');
        
        if (targetHp) {
            // HPを持っている相手ならダメージを与える
            targetHp.damage(this.power);
            
            // 弾丸自身は消滅する
            this.entity.alive = false;
        }
    }
}
```

#### なぜこの書き方が良いのか？
弾丸は「相手が敵クラスかどうか」を気にする必要がありません。「HPを持っている箱であれば何にでも（敵でも、壊せる壁でも、場合によっては味方でも）一律にダメージを与える」というルールで書けるため、新しいキャラやギミックを追加する度にif文による分岐を増やさなくて済むのがECSの強力なポイントです。


