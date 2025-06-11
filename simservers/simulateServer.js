import { execSync } from 'child_process';

const serverId = Number(process.argv[2]);
const BASE_URL = 'http://24.199.102.30:3000';
const ENDPOINT = '/api/store'

async function getSystemUptime() {
  try {
    const uptimeOutput = execSync('uptime').toString();
    const days = uptimeOutput.match(/(\d+)\s+days?/)?.[1] || '0';
    const hours = uptimeOutput.match(/(\d+):(\d+)/)?.[1] || '0';
    const minutes = uptimeOutput.match(/(\d+):(\d+)/)?.[2] || '0';

    return (
      parseInt(days) * 86400 +
      parseInt(hours) * 3600 +
      parseInt(minutes) * 60
    );
  } catch {
    return 0;
  }
}

function generateServerData(id) {
  const names = [
    'Main Database', 'Backup Server', 'Web Server', 'Cache Server',
    'Load Balancer', 'File Server', 'Mail Server', 'DNS Server',
    'Monitoring Server', 'Application Server'
  ];
  const baseUptime = 0; // or await getSystemUptime();
  const uptimeVariation = id * 300;

  return {
    id,
    status: 1,
    name: `${names[id % names.length]} ${Math.floor(id / names.length) + 1}`,
    uptime: baseUptime + uptimeVariation
  };
}

async function simulateServer() {
  const serverData = generateServerData(serverId);

  try {
    const response = await fetch(`${BASE_URL}${ENDPOINT}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(serverData)
    });

    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();
    console.log(`Server ${serverId} updated successfully`, data);
  } catch (e) {
    console.error(`Server ${serverId} update failed:`, e.message);
  }
}

simulateServer();

