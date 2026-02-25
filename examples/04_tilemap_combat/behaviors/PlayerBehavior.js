import { Behavior } from "../../../src/logic/entity/Behavior.js";

export class PlayerBehavior extends Behavior {
    constructor(engine) {
        super();
        this.engine = engine;
        this.maxspeed = 4.0;
        this.jumpPower = -12.0; // ジャンプ力を-12.0に調整

        // Legacy jump physics constants
        this.airJumpCount = 0;
        this.isGrounded = false;

        // 操作性向上のためのバッファ
        this.jumpBuffer = 0;
        this.coyoteTime = 0;

        this.gravity = 0.5;
        this.terminalVelocity = 12;

        this.input = null;
        this.physics = null;
        this.sprite = null;
        this.anim = null;

        // Input buffering / limits
        this.triger = 0;
        this.shot = 0;
    }

    onAttach(entity) {
        super.onAttach(entity);
        // Find required behaviors
        this.physics = this.entity.getBehavior("PhysicsBehavior");
        this.sprite = this.entity.getBehavior("SpriteBehavior");
        this.anim = this.entity.getBehavior("AnimationSystem");

        // Cache input manager
        this.input = this.engine.input;
    }

    update(dt) {
        if (!this.physics || !this.input) return;

        // Note: Map loader generates a 'PhysicsBehavior' that has vy as Y axis.
        // In the legacy code, vel.z was used for height/gravity, but GameCore standard 
        // 2D physics uses vx and vy for horizontal and vertical.

        this.isGrounded = this.physics.isGrounded;

        // 遊びとバッファの更新 (Coyote Time & Jump Buffering)
        if (this.isGrounded) {
            this.coyoteTime = 6; // 地面から離れても6フレームはジャンプ可能とする
            this.airJumpCount = 0;
        } else {
            if (this.coyoteTime > 0) this.coyoteTime--;
        }

        const gameState = this.engine.gameState;
        const maxAirJumps = (gameState && gameState.player.hasDoubleJump) ? 1 : 0;

        // 1. Horizontal Movement
        if (this.input.isPressed('Left')) {
            this.entity.vx = -this.maxspeed;
            if (this.sprite) this.sprite.flipX = true; // Face left
            if (this.anim) this.anim.play("walk");
        } else if (this.input.isPressed('Right')) {
            this.entity.vx = this.maxspeed;
            if (this.sprite) this.sprite.flipX = false; // Face right
            if (this.anim) this.anim.play("walk");
        } else {
            this.entity.vx = 0;
            if (this.anim) this.anim.play("idle");
        }

        // 2. Jump Input & Logic
        // ジャンプキーが押されたらバッファに入れる
        if (this.input.isDown('Jump')) {
            this.jumpBuffer = 6; // 6フレーム前からジャンプ入力を受け付ける
        }

        // ジャンプの実行
        if (this.jumpBuffer > 0) {
            if (this.coyoteTime > 0) {
                // 地上ジャンプ
                this.entity.vy = this.jumpPower;
                this.airJumpCount = 0;
                this.jumpBuffer = 0;
                this.coyoteTime = 0;

                // ジャンプ時の土煙（パーティクル）発生
                if (this.engine.particles) {
                    for (let i = 0; i < 5; i++) {
                        // プレイヤーの足元中心から少し左右に散らばる
                        this.engine.particles.emit({
                            x: this.entity.x + this.entity.width / 2 + (Math.random() * 10 - 5),
                            y: this.entity.y + this.entity.height,
                            vx: (Math.random() - 0.5) * 4,
                            vy: (Math.random() * -2) - 1,
                            life: 300 + Math.random() * 200,
                            color: 'rgba(200, 200, 200, 0.8)',
                            size: 3 + Math.random() * 3,
                            drag: 0.9,
                            gravity: -0.1 // 少し上にフワッと上がる
                        });
                    }
                }
            } else if (this.airJumpCount < maxAirJumps) {
                // 空中ジャンプ
                this.entity.vy = this.jumpPower * 0.9;
                this.airJumpCount++;
                this.jumpBuffer = 0;
            }
        }

        if (this.jumpBuffer > 0) {
            this.jumpBuffer--;
        }

        // 3. Gravity - PhysicsBehavior automatically handles gravity via e.vy += gravity.
        // We just need to limit the terminal velocity.
        if (!this.isGrounded) {
            if (this.entity.vy > this.terminalVelocity) {
                this.entity.vy = this.terminalVelocity;
            }
        } else {
            if (this.entity.vy > 0) this.entity.vy = 0;
        }

        // 4. Update GameState HP (Example stub tracking)
        // If we implement damage later, we decrement HP here in update and trigger game over.
    }
}
