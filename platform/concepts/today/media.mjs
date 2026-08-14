#!/usr/bin/env node
import{mkdirSync,writeFileSync}from'node:fs';import{fileURLToPath}from'node:url';import{join}from'node:path';const out=join(fileURLToPath(new URL('.',import.meta.url)),'assets','media');mkdirSync(out,{recursive:true});const s=(n,b)=>writeFileSync(join(out,n),`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800">${b}</svg>`);
console.log('каталог медиа готов:',out);
