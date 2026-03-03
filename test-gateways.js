import https from 'https';

const options = {
  hostname: 'api.ptmoveis.pt',
  port: 443,
  path: '/wp-json/wc/v3/payment_gateways',
  method: 'GET',
  headers: {
    'Authorization': 'Basic ' + Buffer.from('ck_f72484e730ad6ad7858232fd6af4fddda9cfd248:cs_31973f8571e2eae301b3e93f814a316e98bf1869').toString('base64'),
    'User-Agent': 'Node.js Script'
  }
};

const req = https.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => { data += chunk; });
  res.on('end', () => {
    const gateways = JSON.parse(data);
    const enabled = gateways.filter(g => g.enabled).map(g => ({
        id: g.id,
        title: g.title,
        method_title: g.method_title
    }));
    console.log(JSON.stringify(enabled, null, 2));
  });
});

req.on('error', (e) => {
  console.error(e);
});
req.end();
