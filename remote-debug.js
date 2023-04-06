require('dotenv').config();
const AWS = require('aws-sdk');

const {REMOTE_HOST, REMOTE_PORT, HEAP_PATH, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, BUCKET_NAME} = process.env;

if (!REMOTE_HOST || !REMOTE_PORT || !HEAP_PATH || !AWS_ACCESS_KEY_ID || !AWS_SECRET_ACCESS_KEY || !BUCKET_NAME) {
  throw new Error('REMOTE_HOST, REMOTE_PORT, HEAP_PATH, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, and BUCKET_NAME env values are required.');
}

const RemotePort = parseInt(REMOTE_PORT, 10);
const fileName = `${REMOTE_HOST}_${RemotePort}_${Date.now()}.heapsnapshot`;
const combinedPath = `${HEAP_PATH}/${fileName}`;

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
        console.log('Heap snapshot captured, uploading to S3');
        await uploadToS3();
    }
}).on('error', (err) => {
    console.error(err);
});

async function uploadToS3() {

// set up authentication using environment variables
const s3 = new AWS.S3({
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY
  });

  // read file contents into a buffer
  const fileContent = fs.readFileSync(combinedPath);

  // define parameters for Amazon S3 copy operation
  const params = {
    Bucket: BUCKET_NAME,
    Key: fileName, // the key is the filename in bucket
    Body: fileContent
  };

  s3.upload(params, function(err, data) {
    if (err) console.log(err);
    else console.log('File uploaded successfully');
  });
}