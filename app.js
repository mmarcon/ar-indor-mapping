var	pano = require('./lib/pano.js'),
    arDrone = require('ar-drone'),
    arDroneClient = arDrone.Client,
    fs = require('fs');

var AERIAL_PHOTOS='./aerial-photos', timeToStorePhotos = false;

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
arDroneClient.prototype.capture360Photos = function(){
    var client = this;
    timeToStorePhotos = true;
};

var client = new arDroneClient(), pngStream;

//Is the Drone ready to collect photos?
function shouldStorePhotos(){
    return timeToStorePhotos;
}



// var arDrone = require('ar-drone');
// var client  = arDrone.createClient();
// var fs = require('fs');

//  var pngStream = client.createPngStream();
// pngStream.on('data', function(data){
//     fs.writeFile(new Date() + 'pic.png', data);
// });

client.resume();
client.createRepl();

pngStream = client.createPngStream();
pngStream.on('data', function(PNGData){
    if(shouldStorePhotos()) {
        fs.writeFile(AERIAL_PHOTOS + '/' + Date.now() + '-pic.png', PNGData);
    }
});

pngStream.on('error', function(error){
    console.log(error);
});