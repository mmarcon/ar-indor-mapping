var exec = require('child_process').exec,
    fs = require('fs');

var commandSequence = [
    'pto_gen -o {PATH}project.pto {PATH}*.png',
    'cpfind -o {PATH}project.pto --multirow --celeste {PATH}project.pto',
    'cpclean -o {PATH}project.pto {PATH}project.pto',
    'linefind -o {PATH}project.pto {PATH}project.pto',
    'autooptimiser -a -m -l -s -o {PATH}project.pto {PATH}project.pto',
    'pano_modify --canvas=AUTO --crop=AUTO -o {PATH}project.pto {PATH}project.pto',
    'pto2mk -o {PATH}project.mk -p prefix {PATH}project.pto',
    'make -f {PATH}project.mk all'
], running = false;

var run = function(where, done){
    console.log(where);
    running = true;
    if (typeof where === 'function') {
        done = where;
        where = '';
    } else {
        where += '/';
    }
    //Make a local copy of command sequence
    var commands = commandSequence.slice(),
    _run = function() {
        var command;
        
        //If there are no more commands to run then we are done
        if (commands.length === 0) {
            running = false;
            done();
            return;
        }

        //Get the next command in the stack and exec it
        command = commands.shift();
        command = command.replace(/\{PATH\}/g, where);

        console.log(command);
        exec(command, function callback(error, stdout, stderr){
            if(error) {
                //Uh, something wrong happened, return an error
                running = false;
                done(error);
                return;
            }
            else {
                //All good, run the next command
                _run();
            }
        });
    };
    _run();
};

function numberOfImages(path, callback) {
    fs.readdir(path, function(err, files){
        var filtered = files.filter(function(f){
            return !!f.match(/\.png/);
        });
        filtered.forEach(function(v){
            console.log('Pano::image:' + v);
        });
        callback(filtered.length);
    });
}

module.exports = {
    run: run,
    isDone: function(){
        return running  === false;
    },
    numberOfImages: numberOfImages
};