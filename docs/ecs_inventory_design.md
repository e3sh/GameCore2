# ECSアーキテクチャにおけるインベントリとアイテムの設計方針

## 基本コンセプト
「マップ上に落ちているアイテム」と「インベントリ（持ち物）内のデータとしてのアイテム」を明確に分けて管理します。
インベントリ機能はプレイヤーエンティティの中に全て実装するのではなく、コンポーネント（Behavior）として独立させる設計を推奨します。

## 1. マップ上の「落ちているアイテム」の扱い
マップ上に存在している間、アイテムは1つの **Entity（実体）** として扱います。
このEntityには以下のようなBehaviorをアタッチし、描画や物理挙動、拾われる処理を持たせます。

*   `SpriteBehavior`: アイテムの画像を描画する。
*   `PhysicsBehavior`: 重力で床に落ちる、壁にぶつかるなどの物理挙動を担当する。
*   `ItemPickupBehavior` (新規作成想定): 「近づいたプレイヤー（または他のEntity）に拾われる」という機能を持つ。

## 2. インベントリ（持ち物）の扱い
インベントリのデータ管理には、ゲームの性質によって主に2つのアプローチが考えられます。

### アプローチA： `InventoryBehavior` を作成し、Entityに持たせる（推奨）
「持ち物」という機能を1つのBehaviorとして独立させ、それをプレイヤーなどのEntityに `addBehavior` します。

```javascript
// InventoryBehavior.js の設計イメージ
export class InventoryBehavior extends Behavior {
    constructor(capacity = 20) {
        super();
        this.items = []; // アイテムIDやデータの配列（Entityそのものではないのに注意）
        this.capacity = capacity;
    }

    addItem(itemId, amount) {
        // アイテム追加のロジック
    }

    removeItem(itemId, amount) {
        // アイテム消費のロジック
    }

    hasItem(itemId) { ... }
}
```

**メリット:**
*   **再利用性が高い**: 「NPCにもインベントリを持たせる（ドロップアイテムリストや盗めるアイテム）」「宝箱もインベントリとして扱う（容量制限付きのコンテナ）」といった拡張が容易になります。
*   **責務の分離**: `PlayerBehavior` が「移動や攻撃」などのメインロジックに集中でき、コードの肥大化を防げます。

### アプローチB： ECSの外（グローバルステート）で管理する
RPGのように「メニュー画面を開いてアイテムを使う」「セーブデータと密接に結びついている」「パーティ全体で共有する」といったゲームの場合、インベントリはECSの枠組みから外し、独立したマネージャークラス（例: `InventoryManager` や `GameSession`）で一括管理することも有力な選択肢です。

## 3. 「拾う」処理の流れ（シミュレーション）
ECSアーキテクチャにおいて、マップ上のアイテムを拾い、インベントリに格納するまでの流れは以下のようになります。

1.  **衝突判定**: Player Entity と Item Entity がシステムによって衝突（Collision）検知される。
2.  **イベント発火**: Item側にアタッチされた `ItemPickupBehavior.onCollision(other)` が呼ばれる。
3.  **判定**: `other`（ぶつかってきた相手＝大抵はPlayer）が `InventoryBehavior` を持っているか確認する。
    ```javascript
    const inv = other.getBehavior('InventoryBehavior');
    ```
4.  **受け渡し**: インベントリを持っていれば、アイテムのデータをインベントリに渡す。
    ```javascript
    if (inv && inv.hasSpace()) {
        inv.addItem(this.itemId, 1);
        // 5. 消滅: マップ上のアイテムEntityを消去する。
        this.entity.alive = false;
    }
    ```

## まとめ
*   **Playerの中に全実装するのは避ける**: `PlayerBehavior.js` が複雑になりすぎるのを防ぐため。
*   **Behaviorとして切り出す**: `InventoryBehavior` を作り、機能の1つとしてアタッチするのがECSらしい柔軟な設計。
*   **EntityとDataを分ける**: マップ上にある時は「Entity（描画と物理判定を持つ）」ですが、インベントリに入った瞬間にそれは単なる「データ（IDや個数などの数値）」として扱います。インベントリ配列の中にEntityインスタンスそのものを詰め込んではいけません。
