const os = require("os");
const colors = require("colors");
const cluster = require("cluster");

// Static root directory
global.rootDirectoryStart = __dirname;

// CPUs length
const cpuLength = os.cpus().length / 2;

// Start deamon if exists arg
if(process.argv.indexOf("--deamon") !== -1) {
    require("./src/deamon");
    return;
}

// If cluster argument
if(process.argv.indexOf("--cluster") !== -1) {
    // Master process (cluster)
    if(cluster.isMaster) {
        console.log(`> ORENBURG EDUCATION FORUM (cpus: ${cpuLength})`);

        // Launch child process
        for(let i = 0; i < cpuLength; i++) {
            let workerName = "worker-http";

            // Start socket servers
            if(
                i >= (cpuLength / 2) &&
                process.argv.indexOf("--with-socket") !== -1
            )
                workerName = "worker-socket";

            // Launch
            cluster.fork(
                {
                    WORKER_NAME: workerName
                }
            );
        }
    }

    // Worker process (workers)
    if(cluster.isWorker) {
        // Include worker
        require(`./src/${process.env.WORKER_NAME}`);
    }
} else {
    console.log(colors.rainbow(`> EDUCATION PLATFORM (cpus: ${cpuLength})`));

    require(`./src/worker-http`);
    require(`./src/worker-socket`);
}