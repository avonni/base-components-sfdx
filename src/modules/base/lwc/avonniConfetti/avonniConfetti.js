import { LightningElement, api } from 'lwc';
import { normalizeString } from 'c/utilsPrivate';
import './confettiLib';

const VALID_VARIANTS = [
    'base',
    'random-direction',
    'realistic',
    'fireworks',
    'snow',
    'pride'
];
const DEFAULT_COLORS = [
    '#529EE0',
    '#F0E442',
    '#FFB03B',
    '#E16032',
    '#4FD2D2',
    '#006699',
    '#E287B2'
];

export default class AvonniConfetti extends LightningElement {
    @api colors = DEFAULT_COLORS;
    @api originX = 0.5;
    @api originY = 0.5;
    @api zIndex = 100;

    _variant = 'base';
    _name;

    @api
    get variant() {
        return this._variant;
    }

    set variant(value) {
        this._variant = normalizeString(value, {
            fallbackValue: 'base',
            validValues: VALID_VARIANTS
        });
    }

    @api
    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
        this.setAttribute('name', value);
    }

    @api
    fire() {
        switch (this.variant) {
            case 'base':
                this.base();
                break;
            case 'random-direction':
                this.randomDirection();
                break;
            case 'realistic':
                this.realistic();
                break;
            case 'fireworks':
                this.fireworks();
                break;
            case 'snow':
                this.snow();
                break;
            case 'pride':
                this.pride();
                break;
            default:
                this.base();
        }
    }

    base() {
        // eslint-disable-next-line no-undef
        confetti({
            particleCount: 100,
            spread: 70,
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        });
    }

    randomDirection() {
        // eslint-disable-next-line no-undef
        confetti({
            angle: this.randomInRange(55, 125),
            spread: this.randomInRange(50, 70),
            particleCount: this.randomInRange(50, 100),
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        });
    }

    realistic() {
        let count = 200;
        let defaults = {
            origin: {
                x: this.originX,
                y: this.originY
            },
            colors: this.colors,
            zIndex: this.zIndex
        };

        function start(particleRatio, opts) {
            // eslint-disable-next-line no-undef
            confetti(
                Object.assign({}, defaults, opts, {
                    particleCount: Math.floor(count * particleRatio)
                })
            );
        }

        start(0.25, {
            spread: 26,
            startVelocity: 55
        });

        start(0.2, {
            spread: 60
        });

        start(0.35, {
            spread: 100,
            decay: 0.91
        });

        start(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92
        });

        start(0.1, {
            spread: 120,
            startVelocity: 45
        });
    }

    fireworks() {
        let animationEnd = Date.now() + 6000;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.interval = setInterval(() => {
            let timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(this.interval);
            }

            let particleCount = 300;

            // eslint-disable-next-line no-undef
            confetti({
                startVelocity: 30,
                spread: 360,
                ticks: 60,
                particleCount,
                origin: {
                    x: Math.random(),
                    y: Math.random() - 0.2
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
        }, 250);
    }

    snow() {
        let animationEnd = Date.now() + 6000;
        let skew = 1;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.interval = setInterval(() => {
            let timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(this.interval);
            }

            let ticks = Math.max(200, 500 * (timeLeft / 6000));
            skew = Math.max(0.8, skew - 0.001);

            this.colors.forEach((color) => {
                // eslint-disable-next-line no-undef
                confetti({
                    particleCount: 1,
                    startVelocity: 0,
                    ticks: ticks,
                    gravity: 0.5,
                    origin: {
                        x: Math.random(),
                        y: Math.random() * skew - 0.2
                    },
                    colors: [color],
                    zIndex: this.zIndex,
                    shapes: ['circle']
                });
            });
        }, 10);
    }

    pride() {
        let end = Date.now() + 6000;

        // eslint-disable-next-line @lwc/lwc/no-async-operation
        this.interval = setInterval(() => {
            if (Date.now() > end) {
                return clearInterval(this.interval);
            }

            // eslint-disable-next-line no-undef
            confetti({
                angle: 60,
                spread: 55,
                origin: {
                    x: 0
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
            // eslint-disable-next-line no-undef
            confetti({
                angle: 120,
                spread: 55,
                origin: {
                    x: 1
                },
                colors: this.colors,
                zIndex: this.zIndex
            });
        }, 150);
    }

    randomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }
}
