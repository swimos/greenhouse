const spawn = require('child_process').spawn;

class PythonWrapper {
    constructor(pythonFile, showDebug = false, swimUrl = "127.0.0.1") {
        this.showDebug = showDebug;
        this.pythonFile = pythonFile;
        this.pythonProcess = null;
        this.swimUrl = swimUrl;
        if (this.showDebug) {
            console.info('[PythonWrapper] constructed', this.pythonFile);
        }
    }

    start() {
        if (this.showDebug) {
            console.info("[PythonWrapper] start wrapper", this.pythonFile);
        }
        try {
            this.pythonProcess = spawn('python3', [this.pythonFile, this.swimUrl]);
            this.pythonProcess.stdin.setEncoding('utf-8');
            this.pythonProcess.stdout.pipe(process.stdout);        
        } catch(err) {
            console.error("[PythonWrapper] process error: ", err)
        }

        if(this.pythonProcess !== null) {
            this.pythonProcess.stdout.on('data', (data) => {
                if (this.showDebug) {
                    console.log('[PythonWrapper] data', data.toString('utf8'));
                }
            });
            
            this.pythonProcess.stderr.on('data', (data) => {
                if (this.showDebug) {
                    console.log('[PythonWrapper] error', data.toString('utf8'));
                }
            });        
        } else {
            console.error("[PythonWrapper] error starting wrapper ", this.pythonFile)
        }
    }

    stop() {
        if (this.showDebug) {
            console.info("[PythonWrapper] stop wrapper", this.pythonFile);
        }
        this.writeMessage(`{"key":"stop"}`);
        this.pythonProcess.kill('SIGINT');

    }

    writeMessage(msg) {
        if (this.showDebug) {
            // console.info("[PythonWrapper] write message", msg);
        }

        if(this.pythonProcess !== null) {
            try {
                this.pythonProcess.stdin.write(`${msg}\n`);
            } catch(err) {
                this.onError(err);
            }
        } else {
            this.onError("[PythonWrapper] no python process running", this.pythonFile);
        }
    }

    onData(data) {
        if (this.showDebug) {
            console.info("[PythonWrapper] on data: ", data);
        }
    }

    onError(data) {
        console.error("[PythonWrapper] error: ", this.swimUrl, data)
    }
}

module.exports = PythonWrapper;