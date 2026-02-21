/**
 * @class InputMapper
 * @description
 * 物理入力（キーボード等）を論理的なアクション（Jump, Move等）に変換する。
 */
export class InputMapper {
    constructor(inputRaw) {
        this.raw = inputRaw;
        this.mappings = new Map();
        this.axisMappings = new Map();
        this.states = new Map();
        this.lastStates = new Map();
    }

    /**
     * @method bind
     * @param {string} action アクション名
     * @param {string} device 'keyboard' | 'gamepad' | 'mouse'
     * @param {string} key キーコード
     */
    bind(action, device, key) {
        if (!this.mappings.has(action)) {
            this.mappings.set(action, []);
        }
        this.mappings.get(action).push({ device, key });
    }

    /**
     * @method bindAxis
     * @param {string} action アクション名
     * @param {string} device 'gamepad' | 'mouse'
     * @param {string|number} axisKey アナログ軸( gamepadならindex, mouseなら'x','y','dx','dy','wheel' )
     * @param {number} scale 倍率
     */
    bindAxis(action, device, axisKey, scale = 1.0) {
        if (!this.axisMappings.has(action)) {
            this.axisMappings.set(action, []);
        }
        this.axisMappings.get(action).push({ device, axisKey, scale });
    }

    update() {
        // 前フレームの状態を保存
        for (let [action, state] of this.states) {
            this.lastStates.set(action, state);
        }

        for (let [action, binds] of this.mappings) {
            let active = false;
            let deviceAvailable = false;
            for (let bind of binds) {
                const res = this._checkSource(bind);
                if (res.available) {
                    deviceAvailable = true;
                    if (res.pressed) {
                        active = true;
                        break;
                    }
                }
            }
            // デバイスが1件も見当たらない場合は、前フレームの状態を維持（チャタリング/切断対策）
            if (!deviceAvailable && this.lastStates.has(action)) {
                active = this.lastStates.get(action);
            }
            this.states.set(action, active);
        }
    }

    _checkSource(bind) {
        if (bind.device === 'keyboard') {
            return { available: true, pressed: this.raw.keyboard.isPressed(bind.key) };
        }
        if (bind.device === 'mouse') {
            return { available: true, pressed: this.raw.mouse.isPressed(bind.key) };
        }
        if (bind.device === 'gamepad') {
            const gp = this.raw.gamepad.getGamepad();
            return {
                available: !!gp,
                pressed: gp ? this.raw.gamepad.isButtonPressed(bind.key) : false
            };
        }
        return { available: false, pressed: false };
    }

    isPressed(action) {
        return !!this.states.get(action);
    }

    isDown(action) {
        return !!this.states.get(action) && !this.lastStates.get(action);
    }

    isUp(action) {
        return !this.states.get(action) && !!this.lastStates.get(action);
    }

    /**
     * @method getAxis
     * @param {string} action アクション名
     * @returns {number} アナログ値
     */
    getAxis(action) {
        let value = 0;
        const binds = this.axisMappings.get(action);
        if (!binds) return 0;

        for (let bind of binds) {
            if (bind.device === 'gamepad') {
                value += this.raw.gamepad.getAxis(bind.axisKey) * bind.scale;
            } else if (bind.device === 'mouse') {
                if (typeof this.raw.mouse[bind.axisKey] === 'number') {
                    value += this.raw.mouse[bind.axisKey] * bind.scale;
                }
            }
        }
        return value;
    }
}
