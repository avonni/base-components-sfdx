export class ToolManager {
    canvas;
    prevDist = 0;
    moveCoordinatesAdded = 0;

    constructor(canvasInfo) {
        this.canvas = canvasInfo;
    }

    /*
     * ------------------------------------------------------------
     *  PUBLIC METHODS
     * -------------------------------------------------------------
     */

    /**
     * Sets up coordinates for beginning of a line
     *
     * @param {Event} event
     */
    setupLine() {
        // setup all tools should do
    }

    /**
     * Draws a stroke between coordinates
     *
     * @param {Event} event
     */
    draw() {
        // draw all tools should do
    }

    /**
     * Finishes coordinate management for end of a line
     *
     * @param {Event} event
     */
    closeLine() {
        // close all tools should do
        this.canvas.xPositions = [];
        this.canvas.yPositions = [];
        this.canvas.velocities = [];
        this.moveCoordinatesAdded = 0;
        this.prevDist = 0;
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Sets up a stroke for the canvas ctx
     *
     * @param {number} strokeSize
     */
    setupStroke(strokeSize) {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.lineCap = 'round';
        this.canvas.ctx.lineJoin = 'round';
        this.canvas.ctx.strokeStyle = this.canvas.color;
        this.canvas.ctx.lineWidth = strokeSize;
    }

    /**
     * Draws a dot at position[0] coordinates
     *
     * @param {number} dotSize
     */
    drawDot(dotSize) {
        this.canvas.ctx.beginPath();
        this.canvas.ctx.globalCompositeOperation =
            this.canvas.mode === 'erase' ? 'destination-out' : 'source-over';
        this.canvas.ctx.arc(
            this.canvas.xPositions[0],
            this.canvas.yPositions[0],
            dotSize,
            0,
            2 * Math.PI,
            false
        );
        this.canvas.ctx.fillStyle = this.canvas.color;
        this.canvas.ctx.fill();
    }
}
