/**
 * @class UIElement
 * @description
 * シーン上に配置されるUI要素。親子構造をサポート。
 */
export class UIElement {
    constructor() {
        this.x = 0;
        this.y = 0;
        this.width = 100;
        this.height = 30;
        this.visible = true;
        this.parent = null;
        this.children = [];
    }

    addChild(child) {
        child.parent = this;
        this.children.push(child);
        return child;
    }

    getGlobalPos() {
        if (!this.parent) return { x: this.x, y: this.y };
        const pPos = this.parent.getGlobalPos();
        return { x: pPos.x + this.x, y: pPos.y + this.y };
    }

    update(dt, engine) {
        if (!engine) console.error("UIElement.update: engine IS UNDEFINED!");
        this.children.forEach(c => c.update(dt, engine));
    }

    draw(display, layerIndex = 0) {
        if (!this.visible) return;
        this.onDraw(display, layerIndex);
        this.children.forEach(c => c.draw(display, layerIndex));
    }

    onDraw(display) {
        // サブクラスで実装
    }

    hitTest(mx, my) {
        const gPos = this.getGlobalPos();
        return (mx >= gPos.x && mx <= gPos.x + this.width &&
            my >= gPos.y && my <= gPos.y + this.height);
    }
}
