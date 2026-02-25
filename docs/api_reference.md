# GameCore Engine API リファレンス

> **Note**: 本エンジンの主要モジュール（core系、logic系）内の全クラスおよびメソッドに、詳細なJSDocアノテーションが追加されています。VSCode等のエディタを利用することで、強力なコード補完（IntelliSense）やメソッドのホバーリファレンスが機能します。

新しく再構築された統合エンジンの現在の実装状況と API 仕様です。
全てのモジュールは現代的な ES6 クラスとして実装されています。

---

## 1. コア (Core)

### `GameCore`
エンジンのエントリポイント。各サブシステムの初期化とメインループを管理します。

- `constructor(sysParam)`: システム設定を渡して初期化。
    - `viewMode`: `'side'` または `'top'`。
- `input`: `InputMapper` インスタンス
- `inputRaw`: `InputDevices` インスタンス
- `display`: `DisplayManager` インスタンス
- `sprite`: `SpriteSystem` インスタンス
- `sound`: `AudioManager` インスタンス
- `assets`: `AssetManager` インスタンス
- `entities`: `EntityManager` インスタンス
- `scenes`: `SceneNavigator` インスタンス
- `particles`: `ParticleSystem` インスタンス
- `events`: `EventBus` インスタンス

---

## 2. 描画システム (Display & Rendering)

### `DisplayManager`
レイヤー（OffscreenCanvas）の管理と合成を行います。

- `getLayer(index)`: 指定したインデックスのレイヤーオブジェクトを取得。
- `clearAll()`: 全てのレイヤーをクリア。
- `present()`: 全てのレイヤーをメインキャンバスに合成。

### `Layer` (内部クラス)
- `drawImg(...)`: 画像の矩形描画。
- `spPut(...)`: 高度なスプライト描画（回転・反転・行列変換）。

---

## 3. 入力管理 (Input Management)

### `InputMapper`
物理入力を論理アクションに紐付けます。

- `bind(action, device, key)`: デジタル入力を登録。
- `bindAxis(action, device, axisKey, scale)`: アナログ入力を紐付け。
- `isPressed(action)` / `isDown(action)` / `isUp(action)`: 状態判定。
- `getAxis(action)`: アナログ値を取得。

---

## 4. サウンド & アセット (Sound & Assets)

### `AudioManager`
シンセサイザーとサンプリング音源を管理。
- `playScore(namelist, interval)`: Beepcoreメロディ再生。`namelist` は MML 文字列にも対応。
- `playSE(buffer)` / `playBGM(buffer)`: 効果音・BGM再生。

### `Beepcore`
WebAudio API を使用した音響合成システム。
- **MML サポート**: `O`, `L`, `V`, `A-G`, `R` 命令による柔軟な作曲が可能。
- `setLFO(freq, type, depth)`: ビブラート等の周波数変調を設定。
- **特徴**: エンジン同期による低遅延再生、チャタリング防止機能、音源プール管理。

### `AssetManager`
外部リソースの非同期ロード。
- `loadImage` / `loadJSON` / `loadAudio`: 非同期ロード。
- `getImage` / `getData` / `getSound`: ロード済みリソースの取得。

---

## 5. ロジック & ECS (Logic & Entities)

### `EntityManager`
エンティティのライフサイクルと衝突判定を統括。
- `add(entity)`: エンティティを追加。
- `clear()`: エンティティを全削除（シーン遷移用）。
- `update(dt)`: 更新と衝突判定。
- 描画時に `zOrder` と `y` 座標による自動ソート（Yソート）を実施。

### `Entity`
全てのゲームオブジェクトの基底。
- `x, y, z`: 座標。
- `vx, vy, vz`: 速度。
- `width, height, physicalHeight`: サイズ。
- `zOrder`: 描画順。

### `Behavior` (Base Class)
- `update(dt)` / `onCollision(other, colData)` / `draw(display, viewport)`

### `PhysicsBehavior`
- 重力、摩擦、接地判定を自動計算。`viewMode` により重力軸が切り替わる。

---

## 6. シーン管理 (Scene Management)

### `SceneNavigator`
スタックベースのシーン遷移を管理。
- `push(scene)` / `pop()` / `replace(scene)`
- `draw(display)`: スタック内の全シーンを順に描画（透過対応）。

---

## 7. ユーティリティ (Utilities)

### `AnimationSystem`
- Aseprite JSON に対応。`SpriteBehavior` を操作してアニメーション。

### `ParticleSystem`
- 軽量パーティクルエフェクト。

### `MapLoader`
- Tiled Map Editor からのオブジェクト自動生成・配置（Prefab対応）。

---

## 実装状況まとめ (Status)

| カテゴリ | モジュール | 状況 | 備考 |
| :--- | :--- | :--- | :--- |
| **Core** | `GameCore` | ✅ Done | `viewMode` 対応済み |
| **Input** | `InputMapper` | ✅ Done | アクションベース、スティック対応 |
| **Logic** | `Physics` | ✅ Done | サイド/トップ両対応、物理解決 |
| **Logic** | `Collision` | ✅ Done | Z軸フィルタリング対応 |
| **Utility** | `MapLoader` | ✅ Done | プレハブ登録・自動配置 |
| **Utility** | `Particles` | ✅ Done | 軽量スプライト描画対応 |
| **Utility** | `Animation` | ✅ Done | Aseprite JSON インポート |
| **UI** | `UIElement` | ✅ Done | 基本ボタン・ラベル等 |
