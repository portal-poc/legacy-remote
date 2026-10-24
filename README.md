# legacy-remote

Bridge demo: a "legacy" remote on React 18.3 + React Router 7 that shares nothing with the host. The host loads
`./runtime`, sees a different `createElement` and mounts `./RemoteBridge` (MF Bridge, own React root).
React Compiler is not enabled here (React 18 app outside the React singleton).
