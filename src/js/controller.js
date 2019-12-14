import { getPoints } from "./fourier";
import Random from 'random-js';
import { easeInOut } from "./util";

const engine = Random.engines.mt19937().seed(12345)
const random = new Random(engine);

export default class Controller {

	constructor() {
		this.animAmt = 0;
		this.period = 8;

		this.numShapes = 400;

		this.fftDatas = [];
		this.paths = [];
		for (let i = 0; i < this.numShapes; i++) {
			const fftData = this.getRandomFftData(16, 100, 0.5);
			this.fftDatas.push(fftData);
			const path = getPoints(fftData);
			this.paths.push(path);
		}
	}

	/**
	 * Simulate time passing.
	 *
	 * @param {number} dt Time since the last frame, in seconds 
	 */
	update(dt) {
		this.animAmt += dt / this.period;
		this.animAmt %= 1;
	}

	/**
	 * Render the current state of the controller.
	 *
	 * @param {!CanvasRenderingContext2D} context
	 */
	render(context) {
		for (let i = 0; i < this.numShapes; i++) {
			const shapeAmt = i / this.numShapes;
			let localAnimAmt = (this.animAmt - shapeAmt + 1) % 1;
			let anim = easeInOut(localAnimAmt, 2);

			const fftData = this.fftDatas[i];
			const path = this.paths[i];

			context.save();
			context.rotate(2 * Math.PI * i / this.numShapes);

			context.translate(150, 0);

			context.strokeStyle = 'black';
			context.lineWidth = 0.2;

			const startPoint = this.sampleFftData(fftData, 0);
			const startGrad = this.sampleFftDataAccel(fftData, 0);

			const point = this.sampleFftData(fftData, anim);
			const grad = this.sampleFftDataAccel(fftData, anim);
			const angle = Math.atan2(grad.y, grad.x);

			const triRadius = 5;

			context.rotate(-Math.atan2(startGrad.y, startGrad.x));
			context.rotate(Math.PI / 2);
			context.translate(-startPoint.x, -startPoint.y);

			// this.renderPath(context, path);
			context.translate(point.x, point.y);
			context.rotate(angle);

			context.beginPath();
			context.fillStyle = 'black';
			context.moveTo(
				triRadius, 0,
			)
			context.lineTo(
				-triRadius, 0.8 * triRadius,
			)
			context.lineTo(
				-triRadius, -0.8 *  triRadius,
			)
			context.closePath();
			context.fill();

			context.restore();
		}
	}

	sampleFftData(fftData, amt) {
		let x = 0;
		let y = 0;
		for (let fftDatum of fftData) {
            const amplitude = fftDatum.amplitude;
            const angle = 2 * Math.PI * fftDatum.freq * amt + fftDatum.phase;
            x += amplitude * Math.cos(angle);
            y += amplitude * Math.sin(angle);
		}
		return {
			x: x,
			y: y,
		};
	}

	sampleFftDataGradient(fftData, amt) {
		let dx = 0;
		let dy = 0;
		for (let fftDatum of fftData) {
            const amplitude = fftDatum.amplitude;
            const angle = 2 * Math.PI * fftDatum.freq * amt + fftDatum.phase;
            dx += amplitude * fftDatum.freq * -Math.sin(angle);
            dy += amplitude * fftDatum.freq * Math.cos(angle);
		}
		return {
			x: dx,
			y: dy,
		};
	}

	sampleFftDataAccel(fftData, amt) {
		let dx = 0;
		let dy = 0;
		for (let fftDatum of fftData) {
            const amplitude = fftDatum.amplitude;
            const angle = 2 * Math.PI * fftDatum.freq * amt + fftDatum.phase;
            dx += amplitude * fftDatum.freq * fftDatum.freq * -Math.cos(angle);
            dy += amplitude * fftDatum.freq * fftDatum.freq * -Math.sin(angle);
		}
		return {
			x: dx,
			y: dy,
		};
	}

	getRandomFftData(numPoints, size, decay) {
		const defaultSize = 1 / (1 - decay);

		const fftData = [];
		for (let i = -numPoints / 2; i < numPoints / 2; i ++) {
			let maxAmp = (size / defaultSize) * Math.pow(-decay, Math.abs(i));
			if (i == 0) {
				maxAmp = 0;
			}
			var datum = {
				freq: i,
				amplitude: maxAmp,//random.real(0, maxAmp),
				phase: random.real(0, 2 * Math.PI),
			}
			fftData.push(datum);
		}
		return fftData;
	}	

	/**
	 * @param {CanvasRenderingContext2D} context 
	 */
	renderPath(context, path, closePath=true) {
		context.beginPath();
		for (let i = 0; i < path.length; i ++) {
			if (i == 0) {
				context.moveTo(path[i].x, path[i].y);
			}
			else {
				context.lineTo(path[i].x, path[i].y);
			}
		}
		if (closePath) {
			context.closePath();
		}
		context.stroke();
	}

}
