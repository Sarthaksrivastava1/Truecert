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
  if (!window.ethereum) { el('account').textContent='MetaMask not found'; return; }
  web3 = new Web3(window.ethereum);
  contract = new web3.eth.Contract(abi, contractAddress);
  const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
  userAccount = accounts[0];
  el('account').textContent = userAccount;
});

async function addData() {
  const f1 = el('field1').value.trim();
  const f2 = el('field2').value.trim();
  const f3 = el('field3').value.trim();
  const ipfs = el('ipfsUri').value.trim();
  if (!f1||!f2||!f3||!ipfs) { alert('Fill all fields'); return; }
  el('addDataStatus').textContent='Sending…';
  try{
    const receipt = await contract.methods.addData(f1,f2,f3,ipfs).send({from:userAccount});
    let newId = null;
    if (receipt.events && receipt.events.DataAdded && receipt.events.DataAdded.returnValues) {
      newId = receipt.events.DataAdded.returnValues.id;
    } else {
      newId = await contract.methods.dataCount().call();
    }
    el('newId').textContent=newId;
    el('popup').classList.remove('hidden');
    el('addDataStatus').textContent='Added successfully';
  }catch(err){
    console.error(err);
    el('addDataStatus').textContent='Error: '+err.message;
    alert('Error: '+err.message);
  }
}
el('addDataBtn').addEventListener('click',addData);
el('popupClose').addEventListener('click',()=>el('popup').classList.add('hidden'));
