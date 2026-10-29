import { mkdirSync, existsSync, writeFileSync, chmodSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { networkInterfaces } from 'node:os';
import { spawnSync } from 'node:child_process';
import { isIP } from 'node:net';
const directory = resolve('.runtime/https');
let address = process.argv[2];
if (!address) {
  try { address = Object.values(networkInterfaces()).flat().find(i=>i.family==='IPv4'&&!i.internal)?.address; }
  catch { throw new Error('Não foi possível detectar o IP. Informe-o explicitamente: npm run setup:https -- 192.168.1.109'); }
}
if (isIP(address)!==4) throw new Error('Informe o IPv4 local: npm run setup:https -- 192.168.1.109');
mkdirSync(directory,{recursive:true,mode:0o700});chmodSync(directory,0o700);
function run(args) {
  const result=spawnSync('openssl',args,{cwd:directory,stdio:['ignore','pipe','pipe'],encoding:'utf8'});
  if(result.error||result.status!==0) throw new Error(result.error?.message??result.stderr);
  return result.stdout.trim();
}
const state=resolve(directory,'setup.json');
if(existsSync(state)){
  const saved=JSON.parse(readFileSync(state,'utf8'));
  if(saved.address!==address) throw new Error(`Certificado existente emitido para ${saved.address}. Não foi sobrescrito. Use esse IP ou solicite a reemissão antes de alterar arquivos.`);
  for(const file of ['ca-key.pem','ca.crt','key.pem','cert.pem'])if(!existsSync(resolve(directory,file)))throw new Error(`Configuração incompleta: ${file}. Nenhum arquivo foi sobrescrito.`);
  run(['verify','-CAfile','ca.crt','-verify_ip',address,'cert.pem']);
  run(['x509','-checkend','0','-noout','-in','cert.pem']);
  console.log('Certificados existentes preservados e verificados.');
}else{
  for(const file of ['ca-key.pem','ca.crt','key.pem','cert.pem','server.csr','extensions.cnf'])if(existsSync(resolve(directory,file)))throw new Error(`Já existe ${file}; não vou sobrescrevê-lo. Revise a configuração existente.`);
  const previousMask=process.umask(0o077);
  try {
    run(['req','-x509','-newkey','rsa:3072','-sha256','-nodes','-days','30','-keyout','ca-key.pem','-out','ca.crt','-subj','/CN=Museu VR - CA local de desenvolvimento','-addext','basicConstraints=critical,CA:TRUE,pathlen:0','-addext','keyUsage=critical,keyCertSign,cRLSign']);
    run(['req','-new','-newkey','rsa:2048','-nodes','-keyout','key.pem','-out','server.csr','-subj','/CN=Museu VR local']);
    writeFileSync(resolve(directory,'extensions.cnf'),`basicConstraints=critical,CA:FALSE\nkeyUsage=critical,digitalSignature,keyEncipherment\nextendedKeyUsage=serverAuth\nsubjectAltName=DNS:localhost,IP:127.0.0.1,IP:${address}\n`);
    run(['x509','-req','-in','server.csr','-CA','ca.crt','-CAkey','ca-key.pem','-set_serial',`0x${Date.now().toString(16)}`,'-days','30','-sha256','-extfile','extensions.cnf','-out','cert.pem']);
    writeFileSync(state,JSON.stringify({address,created:new Date().toISOString()},null,2));
  } finally { process.umask(previousMask); }
}
for(const file of ['ca-key.pem','key.pem'])chmodSync(resolve(directory,file),0o600);
console.log(run(['x509','-in','ca.crt','-noout','-fingerprint','-sha256']));
console.log(`HTTPS preparado para https://${address}:5174/sites/marie-curie/`);
console.log('Inicie: npm run dev:https');
console.log('No Android, instale SOMENTE ca.crt como certificado de CA para este teste. Nunca copie ca-key.pem ou key.pem.');
console.log('Certificado da CA: http://'+address+':5173/__dev/ca.crt');
console.log('Confira a impressão digital exibida acima antes de confiar no certificado. Nenhum certificado foi instalado automaticamente.');
