var canvas,
    ctx,
    img,
    scaleFactor = 0.615,
    imgOffset = 0,
    data = [],
    moving = false,
    startPos,
    dist = 1;

function init() {
    canvas = $('#cv')[0];
    ctx = canvas.getContext('2d');

    $img = $('#source-img');
    canvas.width = $img.data('width');
    canvas.height = $img.height();
    canvas.style.width = $img.data('width')+'px';
    canvas.style.height = $img.height()+'px';


    $('#interaction').on('mousedown', startMoveBackground).on('mousemove', moveBackground).on('mouseout', stopMoveBackground).on('mouseup', stopMoveBackground);

    img = $img[0];
    setTimeout(redraw, 10);
}

function startMoveBackground(e) {
    moving = true;
    startPos = {
        "left": e.clientX,
        "top": e.clientY
    };
}

function moveBackground(e) {
    if (moving) {
        dist = (e.clientX - startPos.left) / 50;
        move();
    }
}

function move() {
    imgOffset += dist;
    redraw();
    if (moving) {
        setTimeout(move, 10);
    }
}

function stopMoveBackground(e) {
    moving = false;
}

function calculateSlices(img, x, y, pixelWidth, scalingFactor, offset) {
    if (typeof offset === 'undefined') offset = 0;

    var h = img.height,
        w = (img.width - 2) / 2;
    var polarity = (pixelWidth > 0) ? 1 : -1;
    var widthFactor = Math.abs(pixelWidth) / w;

    var delta = Math.abs(pixelWidth);
    var dHeight, dWidth, dy, dx;
    var constant = Math.pow(100000, scalingFactor); //380;
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
        dy -=50;
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
    displayImage(ctx, img, 0, 50, canvas.width, scaleFactor, imgOffset);
}

function displayImage(ctx, img, x, y, pixelWidth, scalingFactor, offset) {
    var slice, sx;

    if (data.length === 0) {
        calculateSlices(img, x, y, pixelWidth, scalingFactor, offset);
    }

    for (var n = 0, len = data.length; n < len; n++) {
        slice = data[n];
        ctx.drawImage(img, slice.sx(offset), slice.sy, slice.sWidth, slice.sHeight, slice.dx, slice.dy, slice.dWidth, slice.dHeight);
    }
}

$('#source-img').on('load', function() {
    init();
});