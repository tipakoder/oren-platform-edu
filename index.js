const os = require("os");
const colors = require("colors");
const cluster = require("cluster");

// CPUs length
const cpuLength = os.cpus().length / 2;

// If cluster argument
if(process.argv.indexOf("--cluster") !== -1) {
    // Master process (cluster)
    if(cluster.isMaster) {
        console.log(`> ORENBURG EDUCATION FORUM (cpus: ${cpuLength})`);

        // Launch child process
        for(let i = 0; i < cpuLength; i++) {
            let workerName = "worker-http";

            if(i > (cpuLength / 2))
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
    console.log(colors.rainbow(`> ORENBURG EDUCATION FORUM (cpus: ${cpuLength})`));

    require(`./src/worker-http`);
    require(`./src/worker-socket`);
}