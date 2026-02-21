/**
 * @class KeyboardDevice
 * @description 生のキーボード入力を管理。
 */
class KeyboardDevice {
    constructor() {
        this.keys = {};
        window.addEventListener('keydown', e => {
            this.keys[e.code] = true;
        });
        window.addEventListener('keyup', e => {
            this.keys[e.code] = false;
        });
    }

    isPressed(code) {
        return !!this.keys[code];
    }
}

/**
 * @class MouseDevice
 * @description 生のマウス入力を管理。
 */
class MouseDevice {
    constructor(element) {
        this.x = 0;
        this.y = 0;
        this.lastX = 0;
        this.lastY = 0;
        this.dx = 0;
        this.dy = 0;
        this.wheel = 0;
        this._wheelAccum = 0; // 非同期で蓄積される値
        this.buttons = {};

        element.addEventListener('mousemove', e => {
            const rect = element.getBoundingClientRect();
            const scaleX = element.width / rect.width;
            const scaleY = element.height / rect.height;
            this.x = (e.clientX - rect.left) * scaleX;
            this.y = (e.clientY - rect.top) * scaleY;
        });

        element.addEventListener('mousedown', e => {
            this.buttons[e.button] = true;
        });

        element.addEventListener('mouseup', e => {
            this.buttons[e.button] = false;
        });

        element.addEventListener('wheel', e => {
            this._wheelAccum += e.deltaY;
        }, { passive: true });
    }

    update() {
        // マウス移動量の算出
        this.dx = this.x - this.lastX;
        this.dy = this.y - this.lastY;
        this.lastX = this.x;
        this.lastY = this.y;

        // ホイール量の確定と蓄積リセット
        this.wheel = this._wheelAccum;
        this._wheelAccum = 0;
    }

    isPressed(button) {
        return !!this.buttons[button];
    }
}

/**
 * @class GamepadDevice
 * @description ゲームパッドの状態を管理。
 */
class GamepadDevice {
    constructor() {
        this.gamepads = [];
        window.addEventListener("gamepadconnected", (e) => {
            console.log("Gamepad connected", e.gamepad);
        });
    }

    /**
     * @method update
     * 毎フレーム呼び出して状態をポーリング。
     */
    update() {
        this.gamepads = navigator.getGamepads ? navigator.getGamepads() : [];
    }

    getGamepad(index = 0) {
        return this.gamepads[index];
    }

    isButtonPressed(buttonIndex, gpadIndex = 0) {
        const gp = this.getGamepad(gpadIndex);
        if (!gp || !gp.buttons[buttonIndex]) return false;
        return gp.buttons[buttonIndex].pressed;
    }

    getAxis(axisIndex, gpadIndex = 0) {
        const gp = this.getGamepad(gpadIndex);
        if (!gp || !gp.axes[axisIndex]) return 0;
        return gp.axes[axisIndex];
    }
}

/**
 * @class InputDevices
 * @description 全ての物理入力デバイスを統括。
 */
export class InputDevices {
    constructor(element) {
        this.keyboard = new KeyboardDevice();
        this.mouse = new MouseDevice(element);
        this.gamepad = new GamepadDevice();
    }

    update() {
        this.mouse.update();
        this.gamepad.update();
    }
}
