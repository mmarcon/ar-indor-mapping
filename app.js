var	pano = require('./lib/pano.js');

pano.run(process.cwd() + '/test-images', function(e){
    if(e) {
        console.log(e);
    }
    else {
        console.log('All done, all good');
    }
});