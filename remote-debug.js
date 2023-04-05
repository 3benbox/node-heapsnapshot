require('dotenv').config();

const {REMOTE_HOST, REMOTE_PORT, HEAP_PATH} = process.env;

if (!REMOTE_HOST || !REMOTE_PORT || !HEAP_PATH) {
  throw new Error('REMOTE_HOST, REMOTE_PORT and HEAP_PATH env values are required.');
}

const RemotePort = parseInt(REMOTE_PORT, 10);

const combinedPath = `${HEAP_PATH}/${REMOTE_HOST}_${RemotePort}_${Date.now()}`;

const CDP = require('chrome-remote-interface');
const fs = require('fs');

const options = {
        host: REMOTE_HOST,
        port: RemotePort
}

CDP(options, async (client) => {
    const {HeapProfiler} = client;
    try {
        console.log("Connected");
        HeapProfiler.addHeapSnapshotChunk((c) => {
                console.log("got chunk");
                fs.appendFileSync(combinedPath, c.chunk);
        });
        HeapProfiler.reportHeapSnapshotProgress();
        const result = await HeapProfiler.takeHeapSnapshot();
        console.log(result);
    } catch (err) {
        console.error(err);
    } finally {
        await client.close();
    }
}).on('error', (err) => {
    console.error(err);
});