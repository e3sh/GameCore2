# GameCore Engine API リファレンス

新しく再構築された統合エンジンの現在の実装状況と API 仕様です。
全てのモジュールは現代的な ES6 クラスとして実装されています。

---

## 1. コア (Core)

### `GameCore`
エンジンのエントリポイント。各サブシステムの初期化とメインループを管理します。

- `constructor(sysParam)`: システム設定を渡して初期化。
- `run()`: ゲームループの開始。
- `stop()`: ゲームループの停止。
- `input`: `InputMapper` インスタンス
- `display`: `DisplayManager` インスタンス
- `sprite`: `SpriteSystem` インスタンス
- `sound`: `AudioManager` インスタンス (内部で `Beepcore` を使用)
- `assets`: `AssetManager` インスタンス
- `entities`: `EntityManager` インスタンス
- `scenes`: `SceneNavigator` インスタンス
- `events`: `EventBus` インスタンス

---

## 2. 描画システム (Display & Rendering)

### `DisplayManager`
レイヤー（OffscreenCanvas）の管理と合成を行います。

- `getLayer(index)`: 指定したインデックスのレイヤーオブジェクトを取得。
- `clearAll()`: 全てのレイヤーをクリア。
- `present()`: 全てのレイヤーをメインキャンバスに合成。

### `Layer` (内部クラス)
- `drawImg(img, sx, sy, sw, sh, dx, dy, dw, dh)`: 画像の矩形描画。
- `spPut(img, sx, sy, sw, sh, dx, dy, dw, dh, m11, m12, m21, m22, tx, ty, alpha, r)`: 高度なスプライト描画（回転・反転・行列変換）。

### `SpriteSystem`
大量の軽量スプライト（レガシー互換）を管理します。

- `setPattern(id, param)`: スプライトのアニメーションパターンを定義。
- `createItem(patternId, x, y)`: スプライトアイテムを生成。

---

## 3. 入力管理 (Input Management)

### `InputMapper`
物理入力を論理アクションに紐付けます。

- `bind(action, device, key)`: デジタル入力を登録。
    - `device`: `'keyboard'`, `'mouse'`, `'gamepad'`
    - `key`: `code` (e.g., 'Space'), `buttonIndex` (e.g., 0)
- `bindAxis(action, device, axisKey, scale)`: アナログ入力（スティック等）を紐付け。
- `update()`: 状態更新。デバイスの一時的な切断（Ghosting）を防止する保護機能付き。
- `isPressed(action)`: 押されているか。
- `isDown(action)`: 押された瞬間か。
- `isUp(action)`: 離された瞬間か。
- `getAxis(action)`: アナログ値（-1.0 ～ 1.0 等）を取得。

---

## 4. サウンド & アセット (Sound & Assets)

### `Beepcore` (AudioManager 経由で利用)
ポーリングベースのシーケンス制御を採用した、低遅延な矩形波/サイン波シンセサイザー。

- `playScore(namelist, interval, now)`: 音名の配列を再生。`performance.now()` に完全同期。
- `setMasterVolume(vol)`: マスター音量の設定。
- **特徴**: エンジン同期により、JSの負荷に関わらず物理操作と音の一致を保証。

### `AssetManager`
外部リソースの非同期ロード。

- `loadImage(key, src)`: 画像のロード。
- `loadJSON(key, src)`: JSON データのロード。
- `getImage(key)`: ロード済み画像の取得。

---

## 5. ロジック & ECS (Logic & Entities)

### `EntityManager`
エンティティのライフサイクルと衝突判定を統括。

- `add(entity)`: エンティティを追加。
- `update(dt)`: 全エンティティの更新と衝突チェックの実行。

### `Entity`
全てのゲームオブジェクトの基底。Behavior（コンポーネント）を持てます。

- `addBehavior(behavior)`: コンポーネントを追加。
- `vx, vy`: 速度プロパティ。
- `width, height`: 当たり判定サイズ。

### `Behavior` (Base Class)
- `update(dt)`: 毎フレームのロジック。
- `onCollision(other)`: 衝突時のコールバック。

### `PhysicsBehavior`
- 重力、摩擦、接地判定を自動計算。

### `CollisionSystem`
- AABB（軸平行境界ボックス）による矩形当たり判定。

---

## 6. シーン管理 (Scene Management)

### `SceneNavigator`
スタックベースのシーン遷移を管理。

- `push(scene)`: シーンを重ねる（ポーズ等）。
- `pop()`: 現在のシーンを閉じて戻る。
- `replace(scene)`: 現在のシーンを入れ替える（ステージ移動等）。

---

## 7. ユーティリティ (Utilities)

### `AnimationSystem`
- Behavior として実装。エンティティのタイルパターン切り替えによるアニメーション。

### `ParticleSystem`
- 軽量パーティクルエフェクト。Behavior として追加可能。

### `MapLoader`
- JSON データからのエンティティ一括生成。

---

## 実装状況まとめ (Status)

| カテゴリ | モジュール | 状況 | 備考 |
| :--- | :--- | :--- | :--- |
| **Core** | `GameCore` | ✅ Done | ループ、初期化の基本。 |
| **Display** | `Layers`, `spPut` | ✅ Done | 高度な変形描画をサポート。 |
| **Asset** | `AssetManager` | ✅ Done | 非同期ロード、キャッシュ。 |
| **Input** | `InputMapper` | ✅ Done | アクションベース、スティック対応。 |
| **Audio** | `Beepcore` | ✅ Done | 低遅延ポーリング方式。 |
| **Logic** | `EntityManager` | ✅ Done | ECS 的な拡張性を確保。 |
| **Logic** | `Collision` | ✅ Done | AABB 矩形当たり判定。 |
| **Scene** | `Navigator` | ✅ Done | スタック型遷移。 |
| **Utility** | `Particles` | ✅ Done | 軽量エフェクト。 |
| **Utility** | `Animation` | ✅ Done | Behavior ベースのスプライトアニメ。 |
| **Utility** | `MapLoader` | 🚧 Partial | プレハブ登録の動的化が必要。 |
| **UI** | `UIElement` | 🚧 Partial | 基本構造のみ。 |
| **Sprite** | `SpriteSystem` | ✅ Done | 旧エンジンの軽量スプライト。 |
