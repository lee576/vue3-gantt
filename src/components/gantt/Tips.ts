// 扩展 HTMLElement 接口
interface HTMLElement {
    ball?: Balloon;
    element?: HTMLElement;
    focus(): void;
    getBoundingClientRect(): DOMRect;
    addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
    removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

// 扩展 HTMLDivElement 接口
interface HTMLDivElement {
    element?: HTMLElement;
}

// 定义 balloon 类
class Balloon {
    timeout: number;
    message: string;
    element: HTMLElement | undefined;
    id: string;
    left: number;
    top: number;
    scroll: boolean;
    _timeouter: number;
    _timerScroll: number;

    constructor(
        element: HTMLElement,
        id: string,
        message: string,
        left: number,
        top: number,
        timeout: number,
        scroll: boolean
    ) {
        // Init value
        this.timeout = -1; // ms
        this.message = "";
        this.element = undefined;
        this.id = "";
        this.left = 0;
        this.top = 6;
        this.scroll = false;
        this._timeouter = -1;
        this._timerScroll = -1;

        if (!isNaN(timeout) && timeout === timeout) this.timeout = parseInt(timeout.toString());
        this.message = message;
        this.element = element;
        this.id = id;
        if (!isNaN(left) && left === left) this.left = parseInt(left.toString());
        if (!isNaN(top) && top === top) this.top = parseInt(top.toString());
        if (scroll != null && scroll != undefined) this.scroll = scroll;
    }

    Show(bRemove?: boolean): boolean {
        if (!this.element) return false;

        const balloon = document.getElementById("balloon_" + this.id);
        if (bRemove != undefined && !bRemove && balloon) return false;

        // 移除相同Id气泡
        if (balloon && (balloon as any).element && (balloon as any).element.ball) {
            (balloon as any).element.ball.Remove(true);
        } else if (balloon) {
            balloon.parentNode?.removeChild(balloon);
        }

        // 生成气泡
        const newBalloon = document.createElement("div");
        newBalloon.className = "balloon";
        newBalloon.id = "balloon_" + this.id;
        const balloonTop = document.createElement("div");
        balloonTop.className = "balloon_top";
        const balloonMeg = document.createElement("div");
        balloonMeg.className = "balloon_meg";
        const balloonTxt = document.createElement("div");
        balloonTxt.className = "balloon_txt";
        const megs = document.createTextNode(this.message);

        newBalloon.appendChild(balloonTop);
        newBalloon.appendChild(balloonMeg);
        balloonMeg.appendChild(balloonTxt);
        balloonTxt.appendChild(megs);
        this.element["ball"] = this;
        (newBalloon as HTMLDivElement).element = this.element;

        document.getElementsByTagName("body")[0].appendChild(newBalloon);

        const nodeView = document.getElementView(this.element);
        const nodeTop = document.getElementTop(this.element);
        const nodeLeft = document.getElementLeft(this.element);

        // 设置气泡位置
        newBalloon.style.top = (nodeTop + nodeView.height + this.top) + "px";
        newBalloon.style.left = (nodeLeft) + "px";

        const mball = this;
        // 设置滚动到焦点
        if (this.scroll) {
            this._timerScroll = setInterval(() => {
                const top = nodeTop - 30 - document.getScrollXY().top;
                const left = nodeLeft - 30 - document.getScrollXY().left;
                if (Math.abs(top) < 5 || Math.abs(left) < 5) {
                    clearInterval(mball._timerScroll);
                    mball._timeouter = -1;
                    mball.element?.focus();
                } else {
                    const newTop = document.getScrollXY().top + top / 5.0;
                    const newLeft = document.getScrollXY().left + left / 5.0;
                    window.scrollTo(newLeft, newTop);
                }
            }, 10);
        }

        // 设置超时消失
        if (this.timeout > 0) {
            this._timeouter = setTimeout(() => {
                mball.Remove();
                if (mball._timerScroll > 0) {
                    clearInterval(mball._timerScroll);
                    mball._timerScroll = -1;
                }
                mball._timeouter = -1;
            }, this.timeout);
        }

        return true;
    }

    Remove(unanimated?: boolean): boolean {
        const id = this.id;
        const node = document.getElementById("balloon_" + id);

        // 清除移除倒计时
        if (this._timeouter > 0) {
            clearTimeout(this._timeouter);
            this._timeouter = -1;
        }

        // 清除滚动到焦点动作
        if (this._timerScroll > 0) {
            clearInterval(this._timerScroll);
            this._timerScroll = -1;
        }

        // 无动画清除气泡
        if (node && unanimated) {
            node.parentNode?.removeChild(node);
            return true;
        }
        // 动画清除气泡
        else if (node) {
            const h = document.getElementView(node.getElementsByTagName("div")[1]).height * 1.00;
            const w = document.getElementView(node.getElementsByTagName("div")[1]).width * 1.00;
            const timer = setInterval(() => {
                const newH = h - 1;
                const newW = w - 1;
                if (newH > 0) node.getElementsByTagName("div")[1].style.height = newH + "px";
                if (newW > 0) node.getElementsByTagName("div")[1].style.width = newW + "px";
                if (newH <= 0 || newW <= 0) {
                    if (node.parentNode) {
                        node.parentNode.removeChild(node);
                    }
                    clearInterval(timer);
                }
            }, 10);
            return true;
        }
        return false;
    }

    toString(): string {
        return this.id + ", " + this.message;
    }
}

// 扩展 document 对象的方法
declare global {
    interface Document {
        getElementView(element: HTMLElement): { width: number; height: number };
        getElementLeft(element: HTMLElement): number;
        getElementTop(element: HTMLElement): number;
        getScrollXY(): { top: number; left: number };
    }
}

document.getElementView = function (element: HTMLElement): { width: number; height: number } {
    if (element !== document.body && element !== document.documentElement) {
        return {
            width: element.getBoundingClientRect().width,
            height: element.getBoundingClientRect().height
        };
    }
    if (document.compatMode === "BackCompat") {
        return {
            width: document.body.clientWidth,
            height: document.body.clientHeight
        };
    } else {
        return {
            width: document.documentElement.clientWidth,
            height: document.documentElement.clientHeight
        };
    }
};

document.getElementLeft = function (element: HTMLElement): number {
    return element.getBoundingClientRect().left;
};

document.getElementTop = function (element: HTMLElement): number {
    return element.getBoundingClientRect().top;
};

document.getScrollXY = function (): { top: number; left: number } {
    let scrOfX = 0, scrOfY = 0;
    if (typeof (window.pageYOffset) === 'number') {
        // Netscape compliant
        scrOfY = window.pageYOffset;
        scrOfX = window.pageXOffset;
    } else if (document.body && (document.body.scrollLeft || document.body.scrollTop)) {
        // DOM compliant
        scrOfY = document.body.scrollTop;
        scrOfX = document.body.scrollLeft;
    } else if (document.documentElement && (document.documentElement.scrollLeft || document.documentElement.scrollTop)) {
        // IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
        scrOfX = document.documentElement.scrollLeft;
    }
    return { top: scrOfY, left: scrOfX };
};

// 导出指令对象
export default {
    // 被插入
    inserted: function (el: HTMLElement, binding: { value: string }) {
        mousEnter(el, binding);
    },
    // 更新值
    update: function (el: HTMLElement, binding: { value: string; oldValue: string }) {
        if (binding.value != binding.oldValue) {
            mousEnter(el, binding);
        }
    },
    unbind: function (el: HTMLElement) {
        el.removeEventListener('mouseenter', mousEnter as unknown as EventListener);
        el.removeEventListener('mouseout', mousEnter as unknown as EventListener);
    }
};

// 添加鼠标事件
function mousEnter(el: HTMLElement, binding: { value: string }) {
    // 划入
    el.addEventListener('mouseenter', viewEnter, false);
    // 离开
    // el.addEventListener('mouseout', viewLeve, false);
    const ball = new Balloon(el, "1", binding.value, 50, 10, 5000, true);

    function viewEnter() {
        ball.Show();
    }
}