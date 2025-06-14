const SERVER_COUNT = 1000;

async function simulateServers() {
  const procs = [];

  for (let i = 1; i <= SERVER_COUNT; i++) {
    // spawn bun processes that run simulateServer.js with server id
    const proc = Bun.spawn({
      cmd: ["bun", "simulateServer.js", String(i)],
      stdout: "inherit",
      stderr: "inherit"
    });
    procs.push(proc);
  }

  // wait for all to finish
  await Promise.all(procs.map(p => p.exited));
}

simulateServers();

