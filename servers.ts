import * as readline from 'readline';

enum ServerStatus {
  ONLINE = 1,
  OFFLINE = 0,
  UNKNOWN = 2
}

// Configuration
// const BASE_URL = 'http://localhost:3000';
const BASE_URL = 'http://24.199.102.30:3000';

// Random server names
const SERVER_NAMES = [
  "Main Database",
  "Backup Server",
  "Web Server",
  "Cache Server",
  "Load Balancer",
  "File Server",
  "Mail Server",
  "DNS Server",
  "Monitoring Server",
  "Application Server",
  "Auth Server",
  "Queue Server",
  "Search Server",
  "Storage Server",
  "Analytics Server"
];

// servers to simulate
const servers = [
  {
    id: 1,
    status: ServerStatus.ONLINE,
    name: "test-1",
    uptime: 0,
  },
  {
    id: 2,
    status: ServerStatus.ONLINE,
    name: "test-2",
    uptime: 0,
  }
]

function makeRequest(server: any) {
  return fetch(`${BASE_URL}/api/cuby/uptime`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      id: server.id,
      status: server.status,
      name: server.name,
      uptime: server.uptime,
    }),
  });
}

function delay(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function updateServerUptime(server: any) {
  // increment the uptime by 1
  server.uptime++;
}

function getRandomServerName(): string {
  return SERVER_NAMES[Math.floor(Math.random() * SERVER_NAMES.length)];
}

function addNewServer() {
  // Get the highest ID currently in use
  const maxId = servers.reduce((max, server) => Math.max(max, server.id), 0);

  // Create new server with incremented ID
  const newServer = {
    id: maxId + 1,
    status: ServerStatus.ONLINE,
    name: getRandomServerName(),
    uptime: 0,
  };

  servers.push(newServer);
  return newServer;
}

function clearTerminal() {
  // Clear terminal and move cursor to top-left
  process.stdout.write('\x1Bc');
}

function printInstructions() {
  console.log('=== Server Simulation Controls ===');
  console.log('  r: Reset server 1 uptime to 0 (simulate reboot)');
  console.log('  d: Remove the last server from the list');
  console.log('  a: Add a new server with random name');
  console.log('  Ctrl+C: Stop simulation');
  console.log('===============================\n');
}

function formatServerStatus(response: Response, server: any) {
  const statusEmoji = response.ok ? '✅' : '❌';
  return `${statusEmoji} Server ${server.name.padEnd(20)} ID: ${String(server.id).padEnd(3)} Status: ${response.status} Uptime: ${server.uptime}s`;
}

async function simulate() {
  // run until ctrl+c
  while (true) {
    clearTerminal();
    printInstructions();

    console.log('Current Servers:', servers.length);
    console.log('----------------------------------------');

    const serverResponses: string[] = [];
    for (const server of servers) {
      updateServerUptime(server);
      const response = await makeRequest(server);
      serverResponses.push(formatServerStatus(response, server));
    }

    // Print all responses
    console.log(serverResponses.join('\n'));
    console.log('----------------------------------------');

    // Get overall system status
    try {
      const statusResponse = await fetch(`${BASE_URL}/api/cuby/uptime`);
      const status = await statusResponse.text();
      const statusMap = {
        '0': '✅ All systems operational',
        '1': '⚠️ Reboot detected',
        '2': '❌ Server offline detected'
      };
      console.log('\nSystem Status:', statusMap[status as keyof typeof statusMap] || `Unknown (${status})`);
    } catch (error) {
      console.log('\nSystem Status: Failed to fetch');
    }

    await delay(1000);
  }
}

// Configure readline for key events
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

// Handle key events
process.stdin.on('keypress', (str, key) => {
  if (key.ctrl && key.name === 'c') {
    clearTerminal();
    console.log('Simulation stopped');
    process.exit(0);
  } else if (key.name === 'r') {
    servers[0].uptime = 0;
  } else if (key.name === 'd') {
    if (servers.length > 1) {
      servers.pop();
    }
  } else if (key.name === 'a') {
    addNewServer();
  }
});

// Start simulation
simulate();
