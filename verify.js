const contractAddress = "0xc0210Ad81F4e491A72e0873765c0Ad52751e23f6";
const abi = [
  {
    "inputs": [
      {"internalType":"string","name":"_field1","type":"string"},
      {"internalType":"string","name":"_field2","type":"string"},
      {"internalType":"string","name":"_field3","type":"string"},
      {"internalType":"string","name":"_ipfsUri","type":"string"}
    ],
    "name":"addData","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],
    "stateMutability":"nonpayable","type":"function"
  },
  {"inputs":[{"internalType":"address[4]","name":"_users","type":"address[4]"}],"stateMutability":"nonpayable","type":"constructor"},
  {"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"id","type":"uint256"},{"indexed":true,"internalType":"address","name":"addedBy","type":"address"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"string","name":"ipfsUri","type":"string"}],"name":"DataAdded","type":"event"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"allowedUsers","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"dataCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"dataEntries","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"addedBy","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"field1","type":"string"},{"internalType":"string","name":"field2","type":"string"},{"internalType":"string","name":"field3","type":"string"},{"internalType":"string","name":"ipfsUri","type":"string"}],"stateMutability":"view","type":"function"},
  {"inputs":[],"name":"getAllowedUsers","outputs":[{"internalType":"address[4]","name":"","type":"address[4]"}],"stateMutability":"view","type":"function"},
  {"inputs":[{"internalType":"uint256","name":"_id","type":"uint256"}],"name":"getData","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"addedBy","type":"address"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"string","name":"field1","type":"string"},{"internalType":"string","name":"field2","type":"string"},{"internalType":"string","name":"field3","type":"string"},{"internalType":"string","name":"ipfsUri","type":"string"}],"stateMutability":"view","type":"function"}
];


let web3, contract, userAccount;
let html5QrcodeScanner = null;
const el = id => document.getElementById(id);

window.addEventListener('load', async () => {
            if (window.ethereum) {
                web3 = new Web3(window.ethereum);
                await ethereum.request({ method: 'eth_requestAccounts' });
                contract = new web3.eth.Contract(abi, contractAddress);
            } else {
                alert('MetaMask not detected. Please install it!');
            }
        });

window.addEventListener('load', async () => {
  if (!window.ethereum) {
    el('account').textContent = 'MetaMask not found';
    return;
  }
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(abi, contractAddress);

  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  userAccount = accounts[0];
  el('account').textContent = userAccount;
});

async function getData() {
  const id = el('getId').value;
  const resultEl = el('dataResult');

  if (!id) {
    resultEl.textContent = 'Please enter an ID.';
    return;
  }

  try {
    resultEl.innerHTML = '<p>Fetching data...</p>';

    const data = await contract.methods.getData(id).call();

    if (data.field1 === '' && data.field2 === '' && data.field3 === '') {
      resultEl.innerHTML = '<p class="error">Certificate not found.</p>';
      return;
    }

    const ipfsLink = `${data.ipfsUri}`;

    resultEl.innerHTML = `
      <div class="card result-card">
        <h3>Certificate Details</h3>
        <p><strong>Certificate ID:</strong> ${data.id.toString()}</p>
        <p><strong>Name:</strong> ${data.field1}</p>
        <p><strong>Course:</strong> ${data.field2}</p>
        <p><strong>Description:</strong> ${data.field3}</p>
        <p><strong>Added By:</strong> ${data.addedBy}</p>
        <p><strong>Timestamp:</strong> ${new Date(data.timestamp * 1000).toLocaleString()}</p>
        <img src="${ipfsLink}" alt="Certificate Image" style="max-width: 100%; height: auto; margin-top: 15px; border-radius: 2%;">
        <div class="row buttons">
          <a id="downloadBtn" href="${ipfsLink}" download="certificate_${data.id}.jpg" class="btn primary">Download Image</a>
          <a href="${ipfsLink}" target="_blank" class="btn">Open on IPFS</a>
        </div>
      </div>
    `;
  } catch (err) {
    console.error(err);
    el('dataResult').textContent = 'Error fetching: ' + err.message;
  }
}


function openScanner() {
  el('scannerModal').classList.remove('hidden');
  if (html5QrcodeScanner) return;
  const qrRegionId = "qr-reader";
  html5QrcodeScanner = new Html5Qrcode(qrRegionId);
  const config = { fps: 10, qrbox: { width: 250, height: 250 } };
  html5QrcodeScanner.start(
    { facingMode: "environment" },
    config,
    decodedText => {
      const onlyDigits = decodedText.match(/\d+/);
      if (onlyDigits) el('getId').value = onlyDigits[0];
      else el('getId').value = decodedText;
      stopScanner();
      el('scannerModal').classList.add('hidden');
    },
    () => {}
  ).catch(err => alert('Camera error ' + err));
}
function stopScanner() {
  if (!html5QrcodeScanner) return;
  html5QrcodeScanner.stop().then(() => {
    html5QrcodeScanner.clear();
    html5QrcodeScanner = null;
  });
}
el('getDataBtn').addEventListener('click', getData);
el('scanQR').addEventListener('click', openScanner);
el('stopScanner').addEventListener('click', () => { stopScanner(); el('scannerModal').classList.add('hidden'); });
el('closeScanner').addEventListener('click', () => { stopScanner(); el('scannerModal').classList.add('hidden'); });
