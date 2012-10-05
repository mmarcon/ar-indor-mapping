var exec = require('child_process').exec;

var commandSequence = [
    'pto_gen -o project.pto *.JPG',
    'cpfind -o project.pto --multirow --celeste project.pto',
    'cpclean -o project.pto project.pto',
    'linefind -o project.pto project.pto',
    'autooptimiser -a -m -l -s -o project.pto project.pto',
    'pano_modify --canvas=AUTO --crop=AUTO -o project.pto project.pto',
    'pto2mk -o project.mk -p prefix project.pto',
    'make -f project.mk all',
    'rm -f prefix0*.tif project*'
], running = false;

var run = function(where, done){

    running = true;
    if (typeof where === 'function') {
        done = where;
        where = '.';
    }
    else {
        process.chdir(where);
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

module.exports = {
    run: run,
    isDone: function(){
        return running  === false;
    }
};