const { chromium }=require('playwright');const assert=require('node:assert/strict'),fs=require('node:fs');
const out='.cache/gameplay-failures';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1200}}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const button=name=>page.getByRole('button',{name,exact:true});
 const read=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview',2);q.onsuccess=()=>{const db=q.result,r=db.transaction('games').objectStore('games').getAll();r.onsuccess=()=>{db.close();resolve(r.result[0]);};};q.onerror=()=>reject(q.error);}));
 const write=value=>page.evaluate(value=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview',2);q.onsuccess=()=>{const db=q.result,tx=db.transaction('games','readwrite');tx.objectStore('games').put(value);tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>reject(tx.error);};}),value);
 const poll=async fn=>{for(let i=0;i<100;i++){let v=await read();if(fn(v))return v;await page.waitForTimeout(40);}throw Error('Expected saved state was not reached');};
 const settled=()=>page.waitForFunction(()=>{const b=document.querySelector('[aria-label="Preview"]');return b&&b.getAttribute('aria-disabled')!=='true';});
 try{
  await page.goto('http://localhost:8081/',{waitUntil:'networkidle',timeout:120000});await page.locator('[data-preview-ready="true"]').waitFor();await page.getByLabel('Fit to window').uncheck();await button('Add Puzzle').click();await page.getByLabel('Create Puzzle review state').selectOption('after');await button('Create Puzzle').click();await button('Start Playing').waitFor();await button('Start Playing').click();await settled();
  const piece=page.locator('[data-testid="tray-piece"][data-piece="0"]');await piece.scrollIntoViewIfNeeded();await piece.click();await poll(v=>v.current.attempt.selected===0);await settled();
  await page.evaluate(()=>{const original=IDBObjectStore.prototype.put;IDBObjectStore.prototype.put=function(...args){if(this.name==='games'){IDBObjectStore.prototype.put=original;throw new DOMException('Isolated test quota failure','QuotaExceededError');}return original.apply(this,args);};});
  await page.locator('[data-slot="0"]').click();await button('Retry save').waitFor();assert.equal((await read()).current.attempt.board[0],null,'failed write preserves acknowledged board');
  await button('Retry save').click();await poll(v=>v.current.attempt.board[0]===0&&v.current.attempt.status==='paused');await button('Resume').click();await settled();
  await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:true});document.dispatchEvent(new Event('visibilitychange'));});await poll(v=>v.current.attempt.status==='paused');const paused=await read();
  await page.waitForTimeout(600);await page.evaluate(()=>{Object.defineProperty(document,'hidden',{configurable:true,value:false});document.dispatchEvent(new Event('visibilitychange'));});await button('Resume').waitFor();assert.equal((await read()).current.attempt.elapsedMs,paused.current.attempt.elapsedMs,'background does not consume time');
  // Expire a valid near-deadline snapshot, then verify untimed continuation and its durable reward token.
  let row=await read();row.current.attempt.elapsedMs=row.current.definition.durationMs-250;row.current.attempt.status='paused';await write(row);await page.reload({waitUntil:'networkidle'});await button('Resume').click();await page.getByRole('heading',{name:'Time’s up',exact:true}).waitFor();
  await button('Continue untimed').click();await button('Resume').waitFor();row=await poll(v=>v.current.attempt.continuedUntimed);assert.equal(row.current.attempt.status,'paused');assert.equal(row.current.rewardIds.length,1);
  await button('Resume').click();await settled();await button('Pause').click();await settled();
  // Another tab's acknowledged update must win over this stale revision.
  row=await read();row.revision++;row.current.revision=row.revision;await write(row);await button('Resume').click();await button('Reload last saved puzzle').waitFor();assert.equal((await read()).revision,row.revision);
  await button('Reload last saved puzzle').click();await button('Resume').waitFor();await settled();
  // Corrupt current snapshot recovers the validated previous one. Future schema stays untouched.
  row=await read();const expected=row.previous;assert.ok(expected);row.current.attempt.tray.push(row.current.attempt.tray[0]);await write(row);await page.reload({waitUntil:'networkidle'});await button('Resume').waitFor();assert.equal(await page.getByTestId('game-moves').innerText(),`Moves: ${expected.attempt.moves}`);
  row=await read();row.current.definition.cutVersion=2;await write(row);await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'Choose a puzzle first',exact:true}).waitFor();assert.equal((await read()).current.definition.cutVersion,2,'future cut definitions are not rolled back or overwritten');
  row=await read();row.current.schema=99;await write(row);await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'Choose a puzzle first',exact:true}).waitFor();assert.equal((await read()).current.schema,99);
  assert.deepEqual(errors,[]);console.log('PASS: quota failure/retry, acknowledged-save preservation, background pause, timeout/untimed reward, revision conflict, corrupt recovery and future-save preservation.');
 }catch(e){await page.screenshot({path:`${out}/failure.png`,fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
