import { ToolManager } from './avonniToolManager';

const INITIAL_VELOCITY = 10;

export class SmoothToolManager extends ToolManager {
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
        this.canvas.xPositions = [];
        this.canvas.yPositions = [];
        this.canvas.velocities = Array(4).fill(INITIAL_VELOCITY);
        const clientRect = this.canvas.canvasElement.getBoundingClientRect();
        for (let i = 0; i < 4; i++) {
            this.canvas.xPositions.unshift(event.clientX - clientRect.left);
            this.canvas.yPositions.unshift(event.clientY - clientRect.top);
        }
        super.drawDot(
            this.canvas.mode === 'ink'
                ? this.canvas.size / 3
                : this.canvas.size / 2
        );
    }

    /**
     * Draws a stroke between coordinates
     *
     * @param {Event} event
     */
    draw(event) {
        super.draw();
        const distance = this.getDistanceTraveled(event);
        if (distance > 2) {
            this.prevDist = 0;
            if (this.moveCoordinatesAdded >= 2) {
                this.moveCoordinatesAdded = 0;
                this.smoothVelocities();
                this.drawSpline();
            }
            if (this.canvas.xPositions.length > 10) {
                this.canvas.xPositions.pop();
                this.canvas.yPositions.pop();
                this.canvas.velocities.pop();
            }
        } else {
            this.prevDist = distance;
        }
    }

    /**
     * Finishes coordinate management for end of a line
     *
     * @param {Event} event
     */
    closeLine() {
        for (let i = 0; i < this.moveCoordinatesAdded; i++) {
            this.canvas.xPositions.shift();
            this.canvas.yPositions.shift();
            this.canvas.velocities.shift();
        }
        for (let i = 0; i < 2; i++) {
            // add two "phantom" points for calculations
            for (let j = 0; j < 2; j++) {
                this.canvas.xPositions.unshift(this.canvas.xPositions[0]);
                this.canvas.yPositions.unshift(this.canvas.yPositions[0]);
                this.canvas.velocities.unshift(this.canvas.velocities[0] + 2);
            }
            this.drawSpline();
        }
        super.closeLine();
    }

    /*
     * ------------------------------------------------------------
     *  PRIVATE METHODS
     * -------------------------------------------------------------
     */

    /**
     * Distance traveled since last point
     * @param {Event} event
     * @returns {number} distance
     */
    getDistanceTraveled(event) {
        // get positions
        const clientRect = this.canvas.canvasElement.getBoundingClientRect();
        const deltaX =
            this.canvas.xPositions[0] - (event.clientX - clientRect.left);
        const deltaY =
            this.canvas.yPositions[0] - (event.clientY - clientRect.top);
        this.canvas.xPositions[0] = event.clientX - clientRect.left;
        this.canvas.yPositions[0] = event.clientY - clientRect.top;

        // get velocity an distance
        let velocity = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
        const deltaV = Math.abs(this.canvas.velocities[0] - velocity);
        const distance = velocity + this.prevDist;

        // prevent velocity change from being too drastic
        velocity = Math.min(
            Math.max(velocity, this.canvas.velocities[0] - 0.3 * deltaV),
            this.canvas.velocities[0] + 0.3 * deltaV
        );

        // adds coordinate to buffer if we have moved 2 pixels at least since last time
        if (distance > 2) {
            this.moveCoordinatesAdded++;
            this.canvas.xPositions.unshift(event.clientX - clientRect.left);
            this.canvas.yPositions.unshift(event.clientY - clientRect.top);
            this.canvas.velocities.unshift(velocity);
        }
        return distance;
    }

    /**
     * Smooth the current velocity buffer
     */
    smoothVelocities() {
        for (let i = this.canvas.velocities.length - 1; i >= 2; i = i - 1) {
            this.canvas.velocities[i - 1] =
                (this.canvas.velocities[i] + this.canvas.velocities[i - 2]) / 2;
        }
    }

    /**
     * Draws a spline depending on the mode
     */
    drawSpline() {
        switch (this.canvas.mode) {
            case 'ink':
                this.drawTaperSpline(
                    this.getSplinePoints(),
                    (this.canvas.size * 2) /
                        Math.sqrt(this.canvas.velocities[3]),
                    (this.canvas.size * 2) /
                        Math.sqrt(this.canvas.velocities[5])
                );
                break;
            case 'paint':
                this.drawBasicSpline(this.getSplinePoints());
                break;
            default:
                break;
        }
    }

    /**
     * Draws a tapering spline using the initial and final radius.
     * @param {number[]} pts coordinates for the spline in this order [x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2].
     * @param {number} firstRadius Size of first radius (beginning of spline)
     * @param {number} secondRadius Size of second radius (end of spline)
     *
     */
    drawTaperSpline(pts, firstRadius, secondRadius) {
        const adjustedPoints = this.findAdjustedPoints(
            pts,
            firstRadius,
            secondRadius
        );
        this.drawBasicSpline(
            adjustedPoints[0],
            Math.min(firstRadius, secondRadius)
        );
        this.drawBasicSpline(
            adjustedPoints[1],
            Math.min(firstRadius, secondRadius)
        );
    }

    /**
     * Draws a basic spline using 4 coordinates.
     * @param {number[]} pts coordinates for the spline in this order [x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2].
     * @param {string} penSize Size of the pen to draw the spline. Default to current size.
     */
    drawBasicSpline(pts, penSize = this.canvas.size) {
        super.setupStroke(penSize);
        if (this.canvas.mode === 'paint') {
            this.canvas.ctx.lineWidth = this.canvas.size;
            this.canvas.ctx.shadowColor = this.canvas.color;
            this.canvas.ctx.shadowBlur = 2;
        }
        this.canvas.ctx.moveTo(pts[0], pts[1]);
        this.canvas.ctx.bezierCurveTo(
            pts[2],
            pts[3],
            pts[4],
            pts[5],
            pts[6],
            pts[7]
        );
        this.canvas.ctx.stroke();
        this.canvas.ctx.shadowColor = 'none';
        this.canvas.ctx.shadowBlur = 0;
    }

    /**
     * Finds the coordinates for the two splines needed to draw a tapering spline.
     * @param {number[]} pts coordinates for the spline in this order [x1, y1, cpx1, cpy1, cpx2, cpy2, x2, y2].
     * @param {number} bigRadius Size of first radius (beginning of spline)
     * @param {number} smallRadius Size of second radius (end of spline)
     *
     */
    findAdjustedPoints(splinePoints, smallRadius, bigRadius) {
        if (smallRadius > bigRadius) {
            // swap radius values and line direction
            let temp = bigRadius;
            bigRadius = smallRadius;
            smallRadius = temp;
            for (let i = 0; i < 4; i += 2) {
                temp = splinePoints[i];
                splinePoints[i] = splinePoints[6 - i];
                splinePoints[6 - i] = temp;
                temp = splinePoints[i + 1];
                splinePoints[i + 1] = splinePoints[7 - i];
                splinePoints[7 - i] = temp;
            }
        }

        // get vector tangent to spline
        const tangentVector = Array(2);
        tangentVector[0] = splinePoints[2] - splinePoints[0];
        tangentVector[1] = splinePoints[3] - splinePoints[1];

        // find perpendicular unit vector of tangent vector
        const perpendicularVector = [-tangentVector[1], tangentVector[0]];
        const vectorNorm = Math.sqrt(
            perpendicularVector[0] * perpendicularVector[0] +
                perpendicularVector[1] * perpendicularVector[1]
        );
        const unitPerpendicularVector = [
            perpendicularVector[0] / vectorNorm,
            perpendicularVector[1] / vectorNorm
        ];

        // multiply vector by inner radius displacement
        let innerRadius = (bigRadius - smallRadius) / 2;
        const newTopPoints = [...splinePoints];
        const newBottomPoints = [...splinePoints];
        for (const pointSet of [newTopPoints, newBottomPoints]) {
            pointSet[0] =
                splinePoints[0] + unitPerpendicularVector[0] * innerRadius;
            pointSet[1] =
                splinePoints[1] + unitPerpendicularVector[1] * innerRadius;
            innerRadius = -innerRadius;
        }

        return [newBottomPoints, newTopPoints];
    }

    /**
     * Computes spline points and control points following catmull-rom method.
     * @returns {number[]} 8 coords: start coords [0,1] && end coords [6,7] and set of control points [2,3] && [4,5]
     */
    getSplinePoints() {
        if (this.canvas.xPositions.length < 8) {
            return [];
        }

        // initialize variables
        const tension = 1;
        let data = [
            this.canvas.xPositions[7],
            this.canvas.yPositions[7],
            this.canvas.xPositions[5],
            this.canvas.yPositions[5],
            this.canvas.xPositions[3],
            this.canvas.yPositions[3],
            this.canvas.xPositions[1],
            this.canvas.yPositions[1]
        ];
        let x0;
        let y0;
        let x1;
        let y1;
        let x2;
        let y2;
        let x3;
        let y3;
        let cp1x;
        let cp1y;
        let cp2x;
        let cp2y;
        const size = data.length;
        const last = size - 4;
        const spline = [data[0], data[1]];

        // for each group of 4 points, find their corresponding control points.
        for (let i = 0; i < size - 2; i += 2) {
            x0 = i ? data[i - 2] : data[0];
            y0 = i ? data[i - 1] : data[1];

            x1 = data[i + 0];
            y1 = data[i + 1];

            x2 = data[i + 2];
            y2 = data[i + 3];

            x3 = i !== last ? data[i + 4] : x2;
            y3 = i !== last ? data[i + 5] : y2;

            cp1x = x1 + ((x2 - x0) / 6) * tension;
            cp1y = y1 + ((y2 - y0) / 6) * tension;

            cp2x = x2 - ((x3 - x1) / 6) * tension;
            cp2y = y2 - ((y3 - y1) / 6) * tension;
            spline.push(cp1x, cp1y, cp2x, cp2y, x2, y2);
        }
        return spline.slice(6, 14);
    }
}
