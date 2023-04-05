# node-heapsnapshot

A simple script to generate a heap snapshot of a remote running node process.

The following environment variables are required:
- `REMOTE_HOST` is the host of the remote node process
- `REMOTE_PORT` is the port of the remote node process
- `HEAP_PATH` is the local path to the heap snapshot file. The generated file will be concatenated with the host, port,and current timestamp.