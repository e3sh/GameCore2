# GameCore Engine

GameCoreは、ブラウザ上で動作する軽量かつ拡張性の高い2Dゲームエンジンです。
HTML5 Canvas API を基盤とし、Entity-Component-System (ECS) 的な設計（Entity-Behavior型）を採用することで、アクションRPGやアドベンチャーゲームなどの開発を容易にします。

## 特徴 (Features)

* **柔軟な視点切り替え (ViewMode)**:
  * `'side'` (サイドビュー) と `'top'` (トップビュー) の両モードに対応。
  * トップビュー時には Z軸（高さ）と Yソート描画を自動的にサポートします。
* **コンポーネント指向 (Entity-Behavior)**:
  * 全てのゲームオブジェクトは `Entity` として管理されます。
  * `PhysicsBehavior`, `SpriteBehavior`, `AnimationSystem` などのコンポーネント（Behavior）を自由に脱着可能です。
* **強力なツール連携**:
  * **Tiled Map Editor 支持**: `MapLoader` により、マップデータ(JSON)から地形タイルやエンティティを一括生成。
  * **Aseprite アニメーション支持**: JSON データを直接解析し、フレーム名や再生時間を自動セットアップ。
* **音響・演出システム**:
  * **Beepcore MML**: 矩形波シンセサイザー内蔵。MML 記法によるメロディ再生や LFO (ビブラート) に対応。
  * **ParticleSystem**: 軽量なパーティクル演出を大量に管理・描画。
* **入力・シーン管理**:
  * **InputMapper**: 物理入力を論理アクションにバインドし、キーボード・ゲームパッドを統合管理。
  * **SceneNavigator**: スタックベースのシーン管理（ポーズ画面の重ね合わせ等）をサポート。

## インストールと実行 (Getting Started)

GameCoreは標準的なES6モジュールとして構築されているため、ビルドツールは必須ではありません。
ローカルのWebサーバーを使用して `index.html` を開くことで動作します。

```sh
# 例: Python3 の場合
python -m http.server 8080
```

## 基本的な使い方 (Basic Usage)

### 1. エンジンの初期化

```javascript
import { GameCore } from './src/core/gamecore.js';

const engine = new GameCore({
    canvasId: "gameCanvas",
    viewMode: "top", // 'side' または 'top'
    screen: [
        { resolution: { w: 640, h: 480 } }, // 背景レイヤー
        { resolution: { w: 640, h: 480 } }  // UI/前景レイヤー
    ]
});
engine.run();
```

### 2. エンティティと物理挙動

```javascript
import { Entity } from './src/logic/entity/EntityManager.js';
import { PhysicsBehavior } from './src/logic/entity/PhysicsBehavior.js';

const player = new Entity();
player.addBehavior(new PhysicsBehavior({ gravity: 0.5, friction: 0.9 }));
engine.entities.add(player);

// 入力に応じた移動（InputMapper使用例）
engine.input.bind('Jump', 'keyboard', 'Space');
if (engine.input.isDown('Jump')) {
    player.vz = 8; // トップビューでのジャンプ
}
```

## 資料 (Documentation)

詳細な API 仕様や使い方は `docs/` フォルダ内を確認してください。

- [API 総合リファレンス](docs/API_Reference_Detailed.md)
- [Beepcore (MML) 仕様](docs/Beepcore_Reference.md)

## ライセンス (License)
- MIT License
