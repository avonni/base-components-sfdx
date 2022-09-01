import { ToolManager } from './avonniToolManager';

export class StraightToolManager extends ToolManager {
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
    setupLine(event) {
        super.setupLine();
        const clientRect = this.canvas.canvasElement.getBoundingClientRect();
        this.canvas.xPositions.unshift(event.clientX - clientRect.left);
        this.canvas.yPositions.unshift(event.clientY - clientRect.top);
        this.drawDot(this.canvas.size / 2);
    }

    /**
     * Draws a stroke between coordinates
     *
     * @param {Event} event
     */
    draw(event) {
        super.draw();
        this.setupLine(event);
        super.setupStroke(this.canvas.size);
        this.canvas.ctx.globalCompositeOperation =
            this.canvas.mode === 'erase' ? 'destination-out' : 'source-over';
        this.canvas.ctx.moveTo(
            this.canvas.xPositions[1],
            this.canvas.yPositions[1]
        );
        this.canvas.ctx.lineTo(
            this.canvas.xPositions[0],
            this.canvas.yPositions[0]
        );
        this.canvas.ctx.stroke();
        this.canvas.xPositions.pop();
        this.canvas.yPositions.pop();
    }

    /**
     * Finishes coordinate management for end of a line
     *
     * @param {Event} event
     */
    closeLine() {
        super.closeLine();
    }
}
