import { timeout, animationFrame } from 'c/utilsPrivate';
import { ResizeSensor } from './resizeSensor';
import { debounce } from 'c/inputUtils';

const DELAY_TIMEOUT = 200;
export class AvonniResizeObserver {
    constructor(element, resizeCallback) {
        this._resizeObserverAvailable = typeof ResizeObserver === 'function';
        const delayedCallback = (callback) => {
            if (this._running) {
                return;
            }
            this._running = true;

            timeout(DELAY_TIMEOUT)
                // requestAnimationFrame is used to guard against the callback directly reading layout dimensions
                // which may be mutating at the same time leading to layout thrashing
                .then(() => animationFrame())
                .then(() => {
                    callback();
                    this._running = false;
                });
        };
        this._delayedResizeCallback = delayedCallback.bind(
            this,
            resizeCallback
        );
        if (this._resizeObserverAvailable) {
            this._resizeObserver = new ResizeObserver(
                this._delayedResizeCallback
            );
            this.observe(element);
        } else {
            // IE11 and Lightning Locker Service do not support ResizeObserver
            this._resizeSensor = new ResizeSensor(
                element,
                debounce(resizeCallback, 200)
            );
        }
    }

    observe(element) {
        if (this._resizeObserver) {
            // Using requestAnimationFrame as the element may not be physically in the DOM yet.
            // eslint-disable-next-line @lwc/lwc/no-async-operation
            this._requestAnimationId = requestAnimationFrame(() => {
                if (this._resizeObserverAvailable) {
                    this._resizeObserver.observe(element);
                } else if (!this._hasWindowResizeHandler) {
                    window.addEventListener(
                        'resize',
                        this._delayedResizeCallback
                    );
                    this._hasWindowResizeHandler = true;
                }
            });
        } else if (this._resizeSensor) {
            this._resizeSensor.reattach(element);
        }
    }

    disconnect() {
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
        } else if (this._resizeSensor) {
            this._resizeSensor.detach();
            this._resizeSensor = undefined;
        }
        if (this._requestAnimationId) {
            cancelAnimationFrame(this._requestAnimationId);
        }
        window.removeEventListener('resize', this._delayedResizeCallback);
        this._hasWindowResizeHandler = false;
    }
}
