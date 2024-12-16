// script.js

// List of URLs and ports to check
const endpoints = [
    // 1. azvd.corp.linkedin.com
    {
        url: 'azvd.corp.linkedin.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 2. azvd-sea.corp.linkedin.com
    {
        url: 'azvd-sea.corp.linkedin.com',
        ports: [443, 8443],
        protocols: ['TCP']
    },
    // 3. azvd-weu.corp.linkedin.com
    {
        url: 'azvd-weu.corp.linkedin.com',
        ports: [443, 8443],
        protocols: ['TCP']
    },
    // 4. azvd-wus2.corp.linkedin.com
    {
        url: 'azvd-wus2.corp.linkedin.com',
        ports: [443, 8443],
        protocols: ['TCP']
    },
    // 5. *.azurefd.net with subdomains
    ...['hcs-vanityurl-prod-akhwf3exedbre8bf.a02'].map(subdomain => ({
        url: `${subdomain}.azurefd.net`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 6. *.azurefd.com with subdomains
    ...['edge'].map(subdomain => ({
        url: `${subdomain}.azurefd.com`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 7. *.azureedge.net with subdomains
    ...['edge'].map(subdomain => ({
        url: `${subdomain}.azureedge.net`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 8. *.horizon.vmware.com with subdomains
    ...['cloud'].map(subdomain => ({
        url: `${subdomain}.horizon.vmware.com`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 9. *.horizon.omnissa.com with subdomains
    ...['cloud'].map(subdomain => ({
        url: `${subdomain}.horizon.omnissa.com`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 10. vmwhorizon.com
    {
        url: 'vmwhorizon.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 11. okta.com
    {
        url: 'okta.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 12. linkedin.okta.com
    {
        url: 'linkedin.okta.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 13. okta-featureflag-edge.azureedge.net
    {
        url: 'okta-featureflag-edge.azureedge.net',
        ports: [443],
        protocols: ['TCP']
    },
    // 14. workspaceair.com
    {
        url: 'workspaceair.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 15. workspaceoneaccess.com
    {
        url: 'workspaceoneaccess.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 16. linkedin-prod.workspaceair.com
    {
        url: 'linkedin-prod.workspaceair.com',
        ports: [443],
        protocols: ['TCP']
    },
    // 17-23. vmwareidentity domains
    ...['vmwareidentity.com', 'vmwareidentity.eu', 'vmwareidentity.asia', 'vmwareidentity.com.au', 'vmwareidentity.co.uk', 'vmwareidentity.de', 'vmwareidentity.ca'].map(domain => ({
        url: domain,
        ports: [443],
        protocols: ['TCP']
    })),
    // 24-31. cloud-sg-*.horizon.vmware.com
    ...[
        'us-r-westus2',
        'us-r-eastus2',
        'eu-r-northeurope',
        'eu-r-germanywestcentral',
        'eu-r-uksouth',
        'jp-r-japaneast',
        'jp-r-australiaeast',
        'jp-r-centralindia'
    ].map(region => ({
        url: `cloud-sg-${region}.horizon.vmware.com`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 32-39. cloud-sg-*.horizon.omnissa.com
    ...[
        'us-r-westus2',
        'us-r-eastus2',
        'eu-r-northeurope',
        'eu-r-germanywestcentral',
        'eu-r-uksouth',
        'jp-r-japaneast',
        'jp-r-australiaeast',
        'jp-r-centralindia'
    ].map(region => ({
        url: `cloud-sg-${region}.horizon.omnissa.com`,
        ports: [443],
        protocols: ['TCP']
    })),
    // 40. d5u1ogbzngsig.cloudfront.net
    {
        url: 'd5u1ogbzngsig.cloudfront.net',
        ports: [443],
        protocols: ['TCP']
    }
];

// Function to initiate connectivity checks
async function startConnectivityCheck() {
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    resultsTableBody.innerHTML = ''; // Clear previous results

    for (const endpoint of endpoints) {
        for (const protocol of endpoint.protocols) {
            let ports = endpoint.ports;

            // If ports array is empty, set default ports based on protocol
            if (!ports || ports.length === 0) {
                if (protocol === 'TCP') {
                    ports = [443];
                } else {
                    // Handle other protocols as needed
                    ports = [];
                }
            }

            for (const port of ports) {
                // Displaying the URL, Port, and Protocol
                const row = document.createElement('tr');
                const urlCell = document.createElement('td');
                const portCell = document.createElement('td');
                const protocolCell = document.createElement('td');
                const statusCell = document.createElement('td');

                urlCell.textContent = endpoint.url;
                portCell.textContent = port || '-';
                protocolCell.textContent = protocol;

                statusCell.textContent = 'Checking...';
                statusCell.className = 'status-Checking';

                row.appendChild(urlCell);
                row.appendChild(portCell);
                row.appendChild(protocolCell);
                row.appendChild(statusCell);
                resultsTableBody.appendChild(row);

                // Perform the check
                try {
                    let result;
                    if (protocol === 'TCP') {
                        // TCP check via backend
                        result = await checkViaBackend(endpoint.url, port, protocol);
                    } else if (protocol === 'ICMP') {
                        // ICMP (ping) check via backend
                        result = await checkPing(endpoint.url);
                    } else {
                        // Unsupported protocol
                        result = { status: 'Unsupported Protocol' };
                    }

                    // Update status cell with result
                    let statusText = result.status;
                    let statusClass = 'status-' + result.status.replace(/\s+/g, '');

                    statusCell.textContent = statusText;
                    statusCell.className = statusClass;

                } catch (error) {
                    statusCell.textContent = 'Error';
                    statusCell.className = 'status-Error';
                }
            }
        }
    }
}

// Function to check other protocols via backend API
async function checkViaBackend(url, port, protocol) {
    try {
        const response = await fetch(`/api/check-${protocol.toLowerCase()}?host=${encodeURIComponent(url)}&port=${port}`);
        const data = await response.json();
        return { status: data.status === 'Open' ? 'Accessible' : 'Not Accessible' };
    } catch (error) {
        return { status: 'Error' };
    }
}

// Function to perform ICMP (ping) check via backend API (if needed)
async function checkPing(url) {
    try {
        const response = await fetch(`/api/check-ping?host=${encodeURIComponent(url)}`);
        const data = await response.json();
        let status = data.status === 'Alive' ? 'Accessible' : 'Not Accessible';
        return { status };
    } catch (error) {
        return { status: 'Error' };
    }
}

// Event listener for the button
document.getElementById('startCheck').addEventListener('click', startConnectivityCheck);
