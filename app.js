var	pano = require('./lib/pano.js'),
    arDrone = require('ar-drone'),
    arDroneClient = arDrone.Client,
    fs = require('fs');

var AERIAL_PHOTOS='./aerial-photos', takePhoto = false, timeToStorePhotos = false, counter = 0,
    capture = false;

//Watch the photo folder for changes
fs.watch(AERIAL_PHOTOS, function(){

    //When something gets added to the folder and the pano
    //process is not already running then stitch together
    //the photos that are in there.
    if(pano.isDone()) {
        pano.numberOfImages(process.cwd() + '/' + AERIAL_PHOTOS, function(n){
            if (n <= 1) {
                return;
            }

            pano.run(process.cwd() + '/' + AERIAL_PHOTOS, function(e){
                if(e) {
                    console.log(e);
                }
                else {
                    console.log('All done, all good');
                }
            });
        });
    }
});

//Add custom command to the AR Drone client.
//This way I can prepare my sequence of actions to be
//executed when I placed the Drone in the right position.
arDroneClient.prototype.c360 = function(){
    capture = true;
    this.capture();
    return true;
};

arDroneClient.prototype.s360 = function(){
    capture = false;
    return true;
};

arDroneClient.prototype.takePhoto = function(){
    //console.log('TF');
    takePhoto = true;
    return true;
};

arDroneClient.prototype.capture = function(){
    var drone = this;
    if(capture) {
        this.clockwise(0.4);
        this.after(200, function(){
            this.stop();
        }).after(100, function(){
            drone.takePhoto();
        }).after(100, function(){
            this.capture();
        });
    }
    return true;
};

var client = arDrone.createClient(), pngStream;

//Is the Drone ready to collect photos?
function shouldStorePhotos(){
    return timeToStorePhotos;
}

client.createRepl();

//client.on('navdata', console.log);

pngStream = client.createPngStream();
pngStream.on('data', function(PNGData){
    // console.log('got PNG data');
    // if(shouldStorePhotos() && PNGData && PNGData.length > 0) {
    //     fs.writeFile(AERIAL_PHOTOS + '/' + Date.now() + '-pic.png', PNGData);
    // } else 
    //console.log(counter, takePhoto);
    if (!PNGData || PNGData.length <= 0) {
        console.log('No PNG data');
    }
    if(takePhoto && counter < 20 && PNGData && PNGData.length > 0) {
        console.log('saving PNG data');
        fs.writeFile(AERIAL_PHOTOS + '/' + counter + '-photo.png', PNGData, function(e){
            console.log(e);
        });
        takePhoto = false;
        counter ++;
    }
});

// pngStream.on('error', function(error){
//     console.log(error);
//     //pngStream._tcpVideoStream.end();
//     //process.exit(1);
// });

// process.on('uncaughtException', function(err) {
//     if (pngStream) {
//         pngStream._tcpVideoStream.end();
//     }
//     console.log(err);
// });