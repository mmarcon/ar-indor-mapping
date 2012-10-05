
			var canvas, ctx, img, widthSlider, scalingSlider, pw = 600, sf = .615, imgOffset = 0,
					stage, startPos, stageDim, moveInterval, moveDirection, dist = 1, data = [],
					moving = false;

		function init() {
			canvas = $('#cv')[0];
			ctx = canvas.getContext('2d');
			canvas.width = 1024;
			canvas.height = 720;
			canvas.style.width = '1024px';
			canvas.style.height = '720px';

			stage = $('#screen-overlay');
			stage.on('mousedown', startMoveBackground);
			stage.on('mousemove', moveBackground);
			stage.on('mouseout', stopMove);
			stage.on('mouseup', stopMoveBackground);
			// stagePos = stage.position();

			img = $('#source-img')[0];
			redraw();
		}

		function startMoveBackground(e) {
			moving=true;
			startPos = {"left":e.clientX, "top":e.clientY};
		}

		function moveBackground(e) {
			if(moving) {
				dist =  (e.clientX - startPos.left)/50;
				moveRight();
				// var timeInt = 1;

				// if(e.clientX - stagePos.left > parseInt(stage.width(), 10) / 2) {
				// 	if(moveDirection === 'left' || !moveDirection) {
				// 		clearInterval(moveInterval);
				// 		moveInterval = setInterval(function() { moveRight(); }, timeInt);
				// 		moveDirection = 'right';
				// 	}
				// }
				// else {
				// 	if(moveDirection === 'right' || !moveDirection) {
				// 		clearInterval(moveInterval);
				// 		moveInterval = setInterval(function() { moveLeft(); }, timeInt);
				// 		moveDirection = 'left';
				// 	}
				// }
			}
		}

		function stopMove() {
			clearInterval(moveInterval);
			moveDirection = null;
		}

		function moveRight() {
			imgOffset += dist;
			redraw();
			if(moving) {
				setTimeout(moveRight, 10);
			}
		}

		function moveLeft() {
			imgOffset -= dist;
			redraw();
		}

		function stopMoveBackground(e) {
			moving = false;
		}

		function precalculate(img, x, y, pixelWidth, scalingFactor, offset) {
			if(typeof offset === 'undefined') offset = 0;

			var h = img.height,
			    w = (img.width - 2) / 2.5;
			var polarity = (pixelWidth > 0) ? 1 : -1;
			var widthFactor = Math.abs(pixelWidth) / w;

			var delta = Math.abs(pixelWidth);
			var dHeight, dWidth, dy, dx;
			var constant = Math.pow(100000, scalingFactor); //380;

			var firstInc = ((delta / 2) * (delta / 2)) / constant;

			for(var n = 0, len = delta, inc = w / delta, incScale = (1 - scalingFactor) / delta; n < len; n++) {

				(function(m) {
					sx = function(offset) { return ((inc * m + offset) >= 0) ? (inc * m + offset) % img.width : img.width + ((inc * m + offset) % img.width) };
				})(n);
				sy = 0;
				sWidth = inc;
				sHeight = h;

				firstHalf  = h + 100 - firstInc + (((len / 2) - n) * ((len / 2) - n)) / constant;
				secondHalf = h + 100 - firstInc + ((n - (len / 2)) * (n - (len / 2))) / constant;

				dHeight = (n < len / 2) ? firstHalf : secondHalf;
				dWidth = inc * widthFactor;
				dy = y + (h - dHeight) / 2;
				dx = x + (inc * n * widthFactor * polarity);

				data.push({
					sx: sx,
					sy: sy,
					sWidth: sWidth,
					sHeight: sHeight,
					dx: dx,
					dy: dy,
					dWidth: dWidth,
					dHeight: dHeight
				});
			}
		}

		function redraw() {
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			displayImage(ctx, img, 0, 50, canvas.width, sf, imgOffset);
		}

		function displayImage(ctx, img, x, y, pixelWidth, scalingFactor, offset) {
			if(data.length === 0) {
				precalculate(img, x, y, pixelWidth, scalingFactor, offset);
			}

			var slice, sx;
			for(var n = 0, len = data.length; n < len; n++) {
				slice = data[n];
				ctx.drawImage(img, slice.sx(offset), slice.sy, slice.sWidth, slice.sHeight, slice.dx, slice.dy, slice.dWidth, slice.dHeight);
			}
		}

		$(window).on('load', function() {
			init();
		});