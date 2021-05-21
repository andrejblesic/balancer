class Client {
  get(ipfsHash, protocolType = 'ipfs') {
    //const url = `https://${process.env.VUE_APP_IPFS_NODE}/${protocolType}/${ipfsHash}`;
    const url = `${process.env.VUE_APP_IPFS_NODE}/client/weekly-claims/0xE11BA2b4D45Eaed5996Cd0823791E0C93114882d`
    return fetch(url).then(res => res.json());
  }
}

const client = new Client();

export default client;
