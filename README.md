# GameCore Engine

GameCoreは、ブラウザ上で動作する軽量かつ拡張性の高い2Dゲームエンジンです。
HTML5 Canvas API を基盤とし、Entity-Component-System (ECS) アーキテクチャを採用することで、アクションRPGやアドベンチャーゲームなどの開発を容易にします。

## 特徴 (Features)

* **ECSベースの設計 (Entity-Component-System)**:
  * すべてのゲーム内オブジェクトは `Entity` (エンティティ) として管理されます。
  * `Behavior` (コンポーネント) をアタッチすることで、物理演算 (`PhysicsBehavior`)、スプライト描画 (`SpriteBehavior`)、アニメーション (`AnimationSystem`) などの機能を柔軟に追加・組み合わせることができます。
* **強力なツール連携**:
  * **Tiled Map Editor 対応**: `MapLoader` を使用して、Tiledで作成したマップデータ(JSON)とオブジェクトレイヤーをシームレスに読み込めます。
  * **Aseprite アニメーション対応**: AsepriteからエクスポートされたアニメーションJSONデータを直接読み込み、`meta.frameTags` と `duration` を自動解析してゲーム内のアニメーションとして即座に利用可能です。
* **画面レイヤーとUIシステム**:
  * カメラ連動の背景/キャラクター用の描画レイヤー(Layer 0)に加え、画面固定のフロントレイヤー(Layer 1)をサポート。
  * `UIBehavior`, `WindowBehavior`, `TypewriterBehavior` を組み合わせることで、RPG仕様の「メッセージウィンドウ」と「1文字ずつ表示されるテキストエフェクト」を簡単に構築できます。
* **シーン管理**:
  * `TitleScene`, `GameScene` などのシーンベースの画面遷移をサポートし、ローディング画面やステート管理を統合しています。
* **パーティクルと物理演算**:
  * 軽量なAABB（AABB: Axis-Aligned Bounding Box）ベースの当たり判定と重力処理。
  * 回転やフェードアウトを伴う画像ベースの `ParticleSystem` スプラーチャエフェクト。

## インストールと実行 (Getting Started)

GameCoreは標準的なES6モジュールとして構築されているため、ビルドツール(WebpackやVite等)は必須ではありません。
ローカルのWebサーバー（VS CodeのLive Server拡張機能やPythonのhttp.serverなど）を使用して、直接 `index.html` を開くことで動作します。

### サンプルプロジェクトの実行手順

1. リポジトリをクローンします。
2. リポジトリのルート（`GameCore/` が含まれるディレクトリ）でローカルWebサーバーを起動します。
   ```sh
   # 例: Python3がインストールされている場合
   python -m http.server 8080
   ```
3. ブラウザで以下のURLを開いてデモを確認します。
   * **URL:** `http://localhost:8080/GameCore/examples/dsfl_reconstruction/index.html`

## ディレクトリ構成 (Directory Structure)

```text
GameCore/
 ├── src/
 │    ├── core/               # エンジンの基盤部分
 │    │    ├── gamecore.js      # メインエンジンループ
 │    │    ├── display/         # Canvasレイヤー管理・描画ラッパー
 │    │    ├── input/           # キーボード・マウス入力管理
 │    │    ├── audio/           # Web Audio API ラッパー
 │    │    └── assets/          # 画像・JSONの非同期ローダー
 │    ├── logic/              # ゲームロジック・ECS関連
 │    │    ├── collision/       # 衝突判定システム
 │    │    ├── entity/          # Entityと各種Behavior群
 │    │    ├── loader/          # MapLoader (Tiled JSONパース)
 │    │    ├── scene/           # Scene管理基盤
 │    │    └── systems/         # Animation, Particle などの一括更新システム
 │    └── utils/              # 汎用ユーティリティ
 ├── examples/
 │    └── dsfl_reconstruction/  # 各種機能の実装デモおよびテストプロジェクト
 └── docs/                    # API リファレンスなど
```

## 基本的な使い方 (Basic Usage)

### 1. エンジンの初期化とシーンの登録

```javascript
import { GameCore } from './src/core/gamecore.js';
import { Scene } from './src/logic/scene/Scene.js';

// レイヤー構成を指定してエンジンを生成
const engine = new GameCore({
    canvasId: "mainCanvas",
    screen: [
        { resolution: { w: 640, h: 400 } }, // Layer 0: ゲーム画面
        { resolution: { w: 640, h: 400 } }  // Layer 1: UI画面
    ]
});

// カスタムシーンの作成と登録
class MyGameScene extends Scene {
    async init() {
       // 初期化処理...
    }
}
engine.scenes.push(new MyGameScene(engine));

// ゲームループの開始
engine.run();
```

### 2. エンティティの作成とBehaviorのアタッチ

```javascript
import { Entity } from './src/logic/entity/Entity.js';
import { SpriteBehavior } from './src/logic/entity/SpriteBehavior.js';
import { PhysicsBehavior } from './src/logic/entity/PhysicsBehavior.js';

const player = new Entity();
player.x = 100;
player.y = 100;

// 画像描画機能の追加
player.addBehavior(new SpriteBehavior(engine, 'playerImage'));

// 重力と当たり判定機能の追加
player.addBehavior(new PhysicsBehavior());

engine.entities.add(player);
```

## 今後の拡張予定 (Roadmap)
* `TextBehavior` の相対ローカル座標対応
* ブラウザ環境外でのヘッドレステストサポート
* ゲームパッド入力のネイティブバインディング

## ライセンス (License)
- [MIT License]
