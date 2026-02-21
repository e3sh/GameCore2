/**
 * @class EventBus
 * @description
 * アプリケーション全体で利用可能なパブリッシュ/サブスクライブ形式のイベントバス。
 */
export class EventBus {
    constructor() {
        this.listeners = new Map();
    }

    /**
     * @method on
     * @param {string} eventName 
     * @param {Function} callback 
     */
    on(eventName, callback) {
        if (!this.listeners.has(eventName)) {
            this.listeners.set(eventName, []);
        }
        this.listeners.get(eventName).push(callback);
    }

    /**
     * @method off
     * @param {string} eventName 
     * @param {Function} callback 
     */
    off(eventName, callback) {
        const list = this.listeners.get(eventName);
        if (list) {
            this.listeners.set(eventName, list.filter(cb => cb !== callback));
        }
    }

    /**
     * @method emit
     * @param {string} eventName 
     * @param {any} data 
     */
    emit(eventName, data) {
        const list = this.listeners.get(eventName);
        if (list) {
            list.forEach(cb => cb(data));
        }
    }
}
