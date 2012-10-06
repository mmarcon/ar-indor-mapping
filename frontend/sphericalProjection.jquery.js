/*!
 * Pseudo-spherical projection panorama plugin
 * @thingsinjars, licensed MIT
 * Based on http://yuiblog.com/blog/2008/06/23/slicing/
 */
(function($, sphericalProjection) {
	// Constructor
	$[sphericalProjection] = function(img) {


		this.$img = $(img);

		if (img.height === 0) {
			throw new Error('Error: sphericalProjection :: image not loaded');
		}

		// Initialize the panorama
		this.setupVariables();
		this.wrapImageWithElements();
		this.styleElements();
		this.setUpCanvas();
		this.attachEvents();
		this.redraw();

	};

	$.extend($[sphericalProjection].prototype, {
		setupVariables: function() {
			this.canvas = $('<canvas>')[0];
			this.ctx = this.canvas.getContext("2d");
			this.imgOffset = 0;
			this.viewWidth = this.$img.width()/2;
			this.dist = 1;
			this.data = [];
			this.moving = false;
			this.scaleFactor = 0.615;
			this.constant = 1188.5022274370183;
			this.$interactionLayer = $('<div>');
			this.$interactionLayer.data(sphericalProjection, this);

		},
		wrapImageWithElements: function() {
			this.$img.wrap('<div>');
			this.$container = this.$img.parent();

			this.$container.prepend(this.canvas);
			this.$container.append(this.$interactionLayer);
		},
		styleElements: function() {
			this.$container.css({
				"position": "relative",
				"width": this.viewWidth
			});
			this.$img.hide();
			this.$interactionLayer.css({
				"position": "absolute",
				"top": 0,
				"left": 0,
				"width": "100%",
				"height": "100%"
			});
		},
		setUpCanvas: function() {
			this.canvas.width = this.viewWidth;
			this.canvas.height = this.$img.height();
			this.canvas.style.width = this.viewWidth + 'px';
			this.canvas.style.height = this.$img.height() + 'px';
		},
		attachEvents: function() {
			var obj = this;
			this.$interactionLayer
				.on('mousedown', function(e){obj.startMoveBackground(e);})
				.on('mousemove', function(e){obj.moveBackground(e);})
				.on('mouseout mouseup', function(e){obj.stopMoveBackground(e);});
		},
		startMoveBackground: function(e) {
			this.moving = true;
			this.startPos = {
				"left": e.clientX,
				"top": e.clientY
			};
		},

		moveBackground: function(e) {
			if (this.moving) {
				this.dist = (e.clientX - this.startPos.left) / 50;
				this.move();
			}
		},

		stopMoveBackground: function(e) {
			this.moving = false;
		},

		move: function() {
			this.imgOffset += this.dist;
			this.redraw();
			if (this.moving) {
				var _this = this;
				setTimeout(function(){_this.move();}, 10);
			}
		},

		calculateSlices: function(img, x, y, pixelWidth, scalingFactor, offset) {
			if (typeof this.offset === 'undefined') this.offset = 0;

			var h = img.height,
				w = (img.width - 2) / 2;
			var polarity = (pixelWidth > 0) ? 1 : -1;
			var widthFactor = Math.abs(pixelWidth) / w;

			var delta = Math.abs(pixelWidth);
			var dHeight, dWidth, dy, dx;
			var constant = Math.pow(200000, scalingFactor); //380;
			var firstInc = ((delta / 2) * (delta / 2)) / constant;

			for (var n = 0, len = delta, inc = w / delta, incScale = (1 - scalingFactor) / delta; n < len; n++) {

				(function(m) {
					sx = function(offset) {
						return ((inc * m + offset) >= 0) ? (inc * m + offset) % img.width : img.width + ((inc * m + offset) % img.width);
					};
				})(n);
				sy = 0;
				sWidth = inc;
				sHeight = h;

				firstHalf = h + (((len / 2) - n) * ((len / 2) - n)) / constant;
				secondHalf = h + ((n - (len / 2)) * (n - (len / 2))) / constant;

				dHeight = (n < len / 2) ? firstHalf : secondHalf;
				dWidth = inc * widthFactor;
				dy = y + (h - dHeight) / 2;
				dy -= 50;
				dx = x + (inc * n * widthFactor * polarity);
				this.data.push({
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
		},

		redraw: function() {
			this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
			if(this.$img[0].height===0) {
				this.redraw();
			} else {
				this.displayImage(this.ctx, this.$img[0], 0, 50, this.canvas.width, this.scaleFactor, this.imgOffset);
			}
		},

		displayImage: function(ctx, img, x, y, pixelWidth, scalingFactor, offset) {
			var slice, sx;

			if (this.data.length === 0) {
				this.calculateSlices(img, x, y, pixelWidth, scalingFactor, offset);
			}

			for (var n = 0, len = this.data.length; n < len; n++) {
				slice = this.data[n];
				if(img) {
					ctx.drawImage(img, slice.sx(offset), slice.sy, slice.sWidth, slice.sHeight, slice.dx, slice.dy, slice.dWidth, slice.dHeight);
				}
			}
		}
	});
	// jQuery - specific code
	$.fn[sphericalProjection] = function(options) {
		var imgs = this.filter('img');

		// Fail early if we don't have any img passed in
		if (!imgs.length) {
			return this;
		}

		// Merge options passed in with global defaults
		var opt = $.extend({}, $[sphericalProjection].defaults, options);

		imgs.each(function() {
			$(this).data(sphericalProjection, new $[sphericalProjection](this, opt));
		});

		return this;
	};

})(jQuery, 'sphericalProjection');