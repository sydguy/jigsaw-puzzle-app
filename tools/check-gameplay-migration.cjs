const {chromium}=require('playwright'),assert=require('node:assert/strict');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage();
 try{
  // Establish this disposable origin without loading the app or its v2 database.
  await page.route('**/migration-fixture',r=>r.fulfill({contentType:'text/html',body:'<!doctype html><title>Migration fixture</title>'}));
  await page.goto('http://localhost:8081/migration-fixture');
  const before=await page.evaluate(async()=>{
   const c=document.createElement('canvas');c.width=1536;c.height=1024;const ctx=c.getContext('2d');ctx.fillStyle='#6398b5';ctx.fillRect(0,0,c.width,c.height);
   const picture={id:'legacy-photo',title:'Legacy landscape',theme:'My Photo',source:'photo',addedAt:1,data:c.toDataURL('image/jpeg'),width:1536,height:1024};
   await new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview',1);q.onupgradeneeded=()=>{q.result.createObjectStore('pictures',{keyPath:'id'});q.result.createObjectStore('preferences')};q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction(['pictures','preferences'],'readwrite');tx.objectStore('pictures').put(picture);tx.objectStore('preferences').put({sound:false,haptics:false},'guest');tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>reject(tx.error)};});return picture;
  });
  await page.goto('http://localhost:8081/collection',{waitUntil:'networkidle',timeout:120000});await page.getByRole('button',{name:'Select Legacy landscape',exact:true}).waitFor();
  const after=await page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,tx=db.transaction(['pictures','preferences','games']);const p=tx.objectStore('pictures').get('legacy-photo'),s=tx.objectStore('preferences').get('guest'),g=tx.objectStore('games').count();tx.oncomplete=()=>{resolve({version:db.version,picture:p.result,preferences:s.result,games:g.result});db.close()};};}));
  assert.equal(after.version,2);assert.deepEqual(after.picture,before,'legacy image bytes and metadata unchanged');assert.deepEqual(after.preferences,{sound:false,haptics:false});assert.equal(after.games,0);
  console.log('PASS: v1-to-v2 migration adds games while preserving 1536×1024 legacy image bytes, metadata and preferences.');
 }finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
