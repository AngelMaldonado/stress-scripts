import { execSync } from 'child_process';

enum ServerStatus {
  ONLINE = 1,
  OFFLINE = 0,
  UNKNOWN = 2
}

const BASE_URL = 'http://24.199.102.30:3000';
//const BASE_URL = 'http://localhost:3000';
const ENDPOINT = '/api/cuby/uptime'
// Run the simulation
const SERVER_COUNT = 500;
const UPDATE_INTERVAL = 5000; // 5 seconds

interface ServerData {
  id: number;
  status: ServerStatus;
  name: string;
  uptime: number;
}

// Get system uptime in seconds
function getSystemUptime(): number {
  try {
    // Get uptime in seconds from the 'uptime' command
    const uptimeOutput = execSync('uptime').toString();
    // Parse the output to get days, hours, and minutes
    const days = uptimeOutput.match(/(\d+)\s+days?/)?.[1] || '0';
    const hours = uptimeOutput.match(/(\d+):(\d+)/)?.[1] || '0';
    const minutes = uptimeOutput.match(/(\d+):(\d+)/)?.[2] || '0';

    // Convert to seconds
    return (
      parseInt(days) * 86400 + // days to seconds
      parseInt(hours) * 3600 + // hours to seconds
      parseInt(minutes) * 60   // minutes to seconds
    );
  } catch (error) {
    console.error('Failed to get system uptime:', error);
    return 0;
  }
}

// Generate server data with fixed variations
function generateServerData(id: number): ServerData {
  const names = [
    'Main Database',
    'Backup Server',
    'Web Server',
    'Cache Server',
    'Load Balancer',
    'File Server',
    'Mail Server',
    'DNS Server',
    'Monitoring Server',
    'Application Server'
  ];

  // Base uptime from system
  const baseUptime = getSystemUptime();
  // Add fixed variation based on server ID (each server gets 5 minutes more)
  const uptimeVariation = id * 300; // 300 seconds = 5 minutes

  return {
    id,
    status: ServerStatus.ONLINE, // Always 1 (online)
    name: `${names[id % names.length]} ${Math.floor(id / names.length) + 1}`,
    uptime: baseUptime + uptimeVariation
  };
}

// Simulate a single server
async function simulateServer(serverId: number) {
  const serverData = generateServerData(serverId);
  // wait 5 seconds
  await new Promise(resolve => setTimeout(resolve, 5000));

  try {
    // const response = await fetch('http://24.199.102.30:3000/api/cuby/uptime', {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(serverData)
    });

    if (!response.ok) {
      console.log(response);
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log(`Server ${serverId} (${serverData.name}) updated successfully:`, data);
  } catch (error) {
    if (error instanceof Error) {
      console.error(`Server ${serverId} (${serverData.name}) failed to update:`, error.message);
    } else {
      console.error(`Server ${serverId} (${serverData.name}) failed to update: Unknown error`);
    }
  }
}

// Simulate multiple servers
async function simulateServers(count: number) {
  console.log(`Starting simulation of ${count} servers...`);

  // Create an array of server IDs
  const serverIds = Array.from({ length: count }, (_, i) => i + 1);

  // Simulate all servers simultaneously
  await Promise.all(serverIds.map(simulateServer));

  console.log('All servers have been simulated');
}

// function to simulate single fetch 
async function simulateFetch(count: number) {
  console.log(`Starting simulation of ${count} fetches...`);
  for (let i = 0; i < count; i++) {
    const response = await fetch(`${BASE_URL}`)
    console.log(response)
  }
  console.log('All fetches have been simulated');
}

// Initial simulation
simulateServers(SERVER_COUNT);
//simulateFetch(SERVER_COUNT)

// Set up periodic updates
setInterval(() => {
  console.log('\n--- Starting new update cycle ---');
  simulateServers(SERVER_COUNT);
  //simulateFetch(SERVER_COUNT)
}, UPDATE_INTERVAL);

// Handle process termination
process.on('SIGINT', () => {
  console.log('\nStopping server simulation...');
  process.exit(0);
});

