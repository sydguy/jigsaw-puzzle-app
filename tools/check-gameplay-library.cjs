const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const out='.cache/gameplay-library';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),page=await browser.newPage({viewport:{width:1440,height:1200}}),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const button=name=>page.getByRole('button',{name,exact:true});
 const read=store=>page.evaluate(store=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction(store).objectStore(store).getAll();r.onsuccess=()=>{db.close();resolve(r.result)};};}),store);
 const settled=()=>page.waitForFunction(()=>document.querySelector('[aria-label="Preview"]')?.getAttribute('aria-disabled')!=='true');
 const go=async path=>{await page.goto(`http://localhost:8081${path}`,{waitUntil:'networkidle'});await page.locator('[data-preview-ready="true"]').waitFor();};
 try{
  await go('/');await page.getByLabel('Fit to window').uncheck();await button('Add Puzzle').click();await page.getByLabel('Create Puzzle review state').selectOption('after');await button('Create Puzzle').click();await button('Start Playing').waitFor();
  const sample=(await read('games'))[0].current;
  // Reuse the existing seed image only in this disposable browser context.
  await page.evaluate(image=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview');q.onsuccess=()=>{const db=q.result,tx=db.transaction('pictures','readwrite');tx.objectStore('pictures').put({id:'test-photo',title:'Personal test photo',source:'photo',theme:'My Photo',addedAt:Date.now(),data:image,width:1024,height:1024});tx.oncomplete=()=>{db.close();resolve()};tx.onabort=()=>reject(tx.error);};}),sample.puzzle.image.uri);
  await go('/collection');await button('Select Personal test photo').click();await button('Create Puzzle').click();await page.getByTestId('create-selected-picture').waitFor();await button('Create Puzzle').click();await button('Start Playing').waitFor();
  let records=(await read('games')).map(v=>v.current),personal=records.find(r=>r.puzzle.settings.pictureId==='test-photo');assert.ok(personal,'game links personal photo');
  await button('Start Playing').click();await settled();await button('Pause').click();await settled();await button('Resume').click();await settled();await button('Back').click();
  await page.getByRole('link',{name:'Open Personal test photo',exact:true}).click();await button('Increase Rows').click();await button('Create Puzzle').click();await button('Start Playing').waitFor();
  records=(await read('games')).map(v=>v.current);assert.equal(records.filter(r=>r.puzzle.settings.pictureId==='test-photo').length,2,'changed settings create a distinct linked puzzle');assert.equal(records.find(r=>r.id===personal.id).attemptsStarted,1,'Resume does not count another use');
  await button('Back').click();const group=page.getByRole('group',{name:'Personal test photo. Swipe left or press Left Arrow to reveal Delete.',exact:true}).filter({hasText:'36'});await group.focus();await page.keyboard.press('ArrowLeft');await group.getByRole('button',{name:'Delete Personal test photo',exact:true}).click();await button('Delete puzzle').click();
  await page.getByRole('heading',{name:'My Puzzles (2)',exact:true}).waitFor();assert.equal((await read('pictures')).length,1,'Home deletion preserves source picture');
  await go('/collection');await button('Detailed').click();const photo=page.getByRole('group',{name:'Personal test photo. Swipe left or press Left Arrow to reveal Delete.',exact:true});assert.ok((await photo.innerText()).includes('Times Used: 1'));
  await photo.focus();await page.keyboard.press('ArrowLeft');await photo.getByRole('button',{name:'Delete Personal test photo',exact:true}).click();await page.getByText('Personal test photo. This removes the picture and 1 linked puzzle from this device.',{exact:true}).waitFor();await button('Delete picture').click();
  await button('Select Personal test photo').waitFor({state:'detached'});assert.equal((await read('pictures')).length,0);records=await read('games');assert.equal(records.length,1);assert.equal(records[0].id,sample.id,'cascade keeps unrelated puzzle');
  await go('/');await page.getByRole('heading',{name:'My Puzzles (1)',exact:true}).waitFor();assert.deepEqual(errors,[]);console.log('PASS: personal-image linkage, new identity after setting changes, attempt usage counts, Home delete preserves photo, counted picture deletion cascades atomically and preserves unrelated games.');
 }catch(e){await page.screenshot({path:`${out}/failure.png`,fullPage:true});throw e;}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
