const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs');
const out='.cache/gameplay-large';fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true}),context=await browser.newContext({viewport:{width:1440,height:1200},hasTouch:true}),page=await context.newPage(),errors=[];
 page.on('pageerror',e=>errors.push(e.message));const button=name=>page.getByRole('button',{name,exact:true});
 const read=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview');q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('games').objectStore('games').getAll();r.onsuccess=()=>{db.close();resolve(r.result[0]?.current)};};}));
 const poll=async fn=>{for(let i=0;i<100;i++){const v=await read();if(fn(v))return v;await page.waitForTimeout(40)}throw Error('Expected saved state not reached')};
 const settled=()=>page.waitForFunction(()=>document.querySelector('[aria-label="Preview"]')?.getAttribute('aria-disabled')!=='true');
 const cdp=await context.newCDPSession(page);
 const touch=(type,points)=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:points.map(([x,y,id=1])=>({x,y,id,radiusX:2,radiusY:2,force:1}))});
 const swipe=async(x,y,dx)=>{await touch('touchStart',[[x,y]]);for(let i=1;i<=8;i++)await touch('touchMove',[[x+dx*i/8,y]]);await touch('touchEnd',[]);};
 try{
  await page.goto('http://localhost:8081/',{waitUntil:'networkidle',timeout:120000});await page.locator('[data-preview-ready="true"]').waitFor();await page.getByLabel('Fit to window').uncheck();await button('Add Puzzle').click();await page.getByLabel('Create Puzzle review state').selectOption('after');
  await button('225 pieces').click();for(let i=0;i<5;i++)await button('Increase Rows').click();await page.getByLabel('Rows: 20',{exact:true}).waitFor();await page.getByRole('radio',{name:'Stopwatch',exact:true}).click();await page.getByRole('switch',{name:'Rotate pieces',exact:true}).click();await button('Create Puzzle').click();await button('Start Playing').waitFor();
  assert.equal(await page.getByTestId('tray-piece').count(),400);assert.equal(await page.getByRole('gridcell').count(),400);assert.equal((await read()).definition.rotation,true);
  await button('Start Playing').click();await settled();const tray=page.getByTestId('piece-tray-scroll'),b=await tray.boundingBox();assert.equal(await tray.evaluate(n=>getComputedStyle(n).scrollbarWidth),'none');
  await swipe(b.x+b.width-35,b.y+35,-220);const left=await tray.evaluate(n=>n.scrollLeft);assert.ok(left>150,'touch swipe reveals later pieces');
  await swipe(b.x+35,b.y+35,180);assert.ok(await tray.evaluate(n=>n.scrollLeft)<left,'reverse swipe reveals earlier pieces');
  await tray.evaluate(n=>n.scrollLeft=0);const first=page.getByTestId('tray-piece').first(),pid=Number(await first.getAttribute('data-piece'));await first.click();await poll(r=>r.attempt.selected===pid);await settled();let r=await read(),turn=r.attempt.turns[pid];
  await button('Rotate selected piece').click();await poll(r=>r.attempt.turns[pid]===(turn+1)%4);await settled();
  await page.locator('[data-slot="210"]').focus();await page.keyboard.press('Enter');await poll(r=>r.attempt.board[210]===pid);await settled();
  if((await read()).attempt.selected!==pid){await page.locator('[data-slot="210"]').click();await settled();}
  await button('Return selected piece to tray').click();await poll(r=>r.attempt.board[210]===null);await settled();assert.equal((await read()).attempt.moves,2);
  const board=page.getByTestId('puzzle-board'),vp=page.getByTestId('game-board-viewport'),v=await vp.boundingBox(),x=v.x+v.width/2,y=v.y+v.height/2,initial=(await board.boundingBox()).width;
  await touch('touchStart',[[x-35,y,1],[x+35,y,2]]);for(let i=1;i<=8;i++){await touch('touchMove',[[x-35-i*6,y,1],[x+35+i*6,y,2]]);await page.waitForTimeout(20);}await touch('touchEnd',[]);
  assert.ok((await board.boundingBox()).width>initial*1.5,'two-finger pinch enlarges board');
  await touch('touchStart',[[x-25,y,1],[x+25,y,2]]);for(let i=1;i<=8;i++){await touch('touchMove',[[x-25-i*6,y-i*4,1],[x+25-i*6,y-i*4,2]]);await page.waitForTimeout(20);}await touch('touchEnd',[]);
  assert.ok(await vp.evaluate(n=>n.scrollLeft>0&&n.scrollTop>0),'two-finger pan moves viewport');await button('Fit puzzle').click();assert.equal(Math.round((await board.boundingBox()).width),Math.round(initial));
  await button('Pause').click();await settled();for(const [layout,name]of[['0','iphone'],['1','android'],['2','tablet-portrait'],['3','tablet-landscape']]){await page.getByLabel('Preview layout',{exact:true}).selectOption(layout);await page.getByTestId('device-frame').screenshot({path:`${out}/${name}-400.png`});}
  await page.getByLabel('Preview layout',{exact:true}).selectOption('0');await button('Resume').click();await settled();
  await page.evaluate(()=>{const now=performance.now.bind(performance);window.__testTime=0;Object.defineProperty(performance,'now',{configurable:true,value:()=>now()+window.__testTime});window.dispatchEvent(new Event('offline'));window.__testTime=61000;});
  await poll(r=>r.attempt.status==='paused');r=await read();await page.waitForTimeout(500);assert.equal((await read()).attempt.elapsedMs,r.attempt.elapsedMs,'offline pause stops stopwatch');
  await page.evaluate(()=>window.dispatchEvent(new Event('online')));await button('Resume').waitFor();assert.equal((await read()).attempt.status,'paused','reconnect requires explicit Resume');
  assert.deepEqual(errors,[]);console.log('PASS: 400 real pieces, touch swipes both directions, hidden scrollbar, rotation, keyboard placement/return, pinch/pan/Fit, four layouts and offline grace pause.');
 }catch(e){await page.screenshot({path:`${out}/failure.png`,fullPage:true});throw e;}finally{await browser.close()}
})().catch(e=>{console.error(e);process.exitCode=1});
