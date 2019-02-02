import { getPoints } from "./fourier";
import Random from 'random-js';

const engine = Random.engines.mt19937().seed(12345)
const random = new Random(engine);

export default class Controller {

	constructor() {
		this.animAmt = 0;
		this.period = 10;

		this.fftData = this.getRandomFftData(1024, 1000, 0.4);
		this.path = getPoints(this.fftData);
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
		this.renderPath(context, this.path);

		const pt = this.sampleFftData(this.fftData, this.animAmt);
		const grad = this.sampleFftDataGradient(this.fftData, this.animAmt);
		const angle = Math.atan2(grad.y, grad.x);

		const triRadius = 5;
		context.translate(pt.x, pt.y);
		context.rotate(angle);
		context.beginPath();
		context.fillStyle = 'black';
		context.moveTo(
			triRadius, 0,
		)
		context.lineTo(
			-triRadius, triRadius,
		)
		context.lineTo(
			-triRadius, -triRadius,
		)
		context.closePath();
		context.fill();
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

	getRandomFftData(numPoints, size, decay) {
		const fftData = [];
		for (let i = -numPoints / 2; i < numPoints / 2; i ++) {
			let maxAmp = size * Math.pow(-decay, Math.abs(i));
			if (i == 0) {
				maxAmp = 0;
			}
			var datum = {
				freq: i,
				amplitude: random.real(0, maxAmp),
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
