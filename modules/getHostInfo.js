// Regular expression to remove hostname, url and just be left with the port
const regexForPort = /^([^:]+)(:([0-9]+))?$/;

export const getHostInfo = (hostString, defaultPort) => {
  console.log(hostString);
  let host = hostString;
  let port = defaultPort; // Being 443, assuming its HTTPS

  const result = regexForPort.exec(host);
  if (result != null) {
    host = result[1];
    if (result[2] != null) {
      port = result[3];
    }
  }

  return ([host, port]);
};
