const { chromium } = require('playwright');
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path');
const out='.cache/gameplay'; fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const context=await browser.newContext({viewport:{width:1440,height:1200}}), page=await context.newPage();
 const errors=[]; page.on('pageerror',e=>errors.push(e.message));
 const button=name=>page.getByRole('button',{name,exact:true});
 const record=()=>page.evaluate(()=>new Promise((resolve,reject)=>{const q=indexedDB.open('jigsaw-browser-preview',2);q.onerror=()=>reject(q.error);q.onsuccess=()=>{const db=q.result,r=db.transaction('games').objectStore('games').getAll();r.onsuccess=()=>{db.close();resolve(r.result[0]?.current)};};}));
 const settled=async()=>{await page.waitForFunction(()=>{const b=[...document.querySelectorAll('[role="button"]')].find(n=>n.getAttribute('aria-label')==='Preview');return b && b.getAttribute('aria-disabled')!=='true';});};
 const saveMatches=async fn=>{for(let i=0;i<80;i++){const r=await record();if(fn(r))return r;await page.waitForTimeout(50);}throw Error('Save did not reach expected state');};
 try {
  await page.goto('http://localhost:8081/',{waitUntil:'networkidle',timeout:120000}); await page.locator('[data-preview-ready="true"]').waitFor();
  await page.getByLabel('Fit to window').uncheck(); await button('Add Puzzle').click();
  await page.getByLabel('Create Puzzle review state').selectOption('after'); await button('25 pieces').click();
  await button('Create Puzzle').click(); await button('Start Playing').waitFor({timeout:20000});
  assert.equal(await page.getByTestId('tray-piece').count(),25);
  assert.equal(await page.getByTestId('game-clock').innerText(),'09:00');
  const initial=await record(); assert.equal(initial.attemptsStarted,0); assert.equal(initial.definition.side,5);
  await button('Start Playing').click(); await saveMatches(r=>r.attempt.status==='running'); await settled();
  const zero=page.getByTestId('tray-piece').filter({has:page.locator('canvas')}).locator('visible=true');
  const piece=id=>page.locator(`[data-testid="tray-piece"][data-piece="${id}"]`);
  await piece(0).scrollIntoViewIfNeeded(); await piece(0).click(); await saveMatches(r=>r.attempt.selected===0); await settled();
  await page.locator('[data-slot="0"]').click(); await saveMatches(r=>r.attempt.board[0]===0); await settled();
  assert.equal(await page.getByTestId('game-moves').innerText(),'Moves: 1');
  assert.equal(await page.getByTestId('tray-piece').count(),24);
  await piece(4).scrollIntoViewIfNeeded(); const p=await piece(4).boundingBox(),cell=await page.locator('[data-slot="4"]').boundingBox();
  await page.mouse.move(p.x+p.width/2,p.y+p.height/2);await page.mouse.down();await page.mouse.move(p.x+p.width/2,p.y-24,{steps:5});await page.mouse.move(cell.x+cell.width/2,cell.y+cell.height/2,{steps:12});await page.mouse.up();
  await saveMatches(r=>r.attempt.board[4]===4);await settled();
  await button('Pause').click(); await saveMatches(r=>r.attempt.status==='paused'); const paused=await record();
  await page.waitForTimeout(1200); assert.equal((await record()).attempt.elapsedMs,paused.attempt.elapsedMs);
  await button('Preview').click();await page.getByTestId('puzzle-preview').waitFor();await button('Close preview').click(); await button('Resume').waitFor();
  await button('Resume').click();await settled(); await button('Preview').click(); await page.getByTestId('puzzle-preview').waitFor();await button('Close preview').click();await button('Pause').waitFor();await settled();
  assert.deepEqual((await record()).attempt.board,paused.attempt.board,'preview preserves exact board');
  await button('Hint').click();await saveMatches(r=>r.attempt.board[20]===20);await settled();
  await page.getByTestId('device-frame').screenshot({path:path.join(out,'iphone-running.png')});
  const beforeReload=await record(); await page.reload({waitUntil:'networkidle'});await button('Resume').waitFor();
  assert.deepEqual((await record()).attempt.board,beforeReload.attempt.board,'reload restores exact board');
  await button('Resume').click();await settled();await button('Restart').click();await page.getByRole('dialog').waitFor();await button('Cancel').click();await button('Pause').waitFor();await settled();
  assert.equal((await record()).attempt.id,beforeReload.attempt.id);
  await button('Restart').click();await page.getByRole('dialog').waitFor();await button('Restart puzzle').click();await button('Start Playing').waitFor();
  const replay=await record();assert.deepEqual(replay.definition.edges,initial.definition.edges,'replay preserves exact cuts');assert.notEqual(replay.attempt.id,initial.attempt.id);assert.equal(replay.attempt.moves,0);
  await button('Start Playing').click();await settled();
  for(let i=0;i<25;i++){await button('Hint').click();await saveMatches(r=>r.attempt.moves===i+1);if(i<24)await settled();}
  await page.getByRole('heading',{name:'Puzzle completed!',exact:true}).waitFor();const win=await record();assert.equal(win.attempt.status,'completed');assert.equal(win.attemptsStarted,2);
  await page.screenshot({path:path.join(out,'completed.png')});await button('Home').click();await page.getByRole('heading',{name:'My Puzzles (1)',exact:true}).waitFor();
  await page.reload({waitUntil:'networkidle'});await page.getByRole('heading',{name:'My Puzzles (1)',exact:true}).waitFor();
  await page.getByRole('link',{name:'Open Mountain lake sample',exact:true}).click();await button('Play Again').click();await button('Start Playing').waitFor();
  for(const [layout,name] of [['1','android'],['2','tablet-portrait'],['3','tablet-landscape']]){await page.getByLabel('Preview layout',{exact:true}).selectOption(layout);await page.getByTestId('device-frame').screenshot({path:path.join(out,`${name}-ready.png`)});}
  assert.deepEqual(errors,[]);fs.writeFileSync(path.join(out,'results.json'),JSON.stringify({passed:true,errors},null,2));
  console.log('PASS: real cuts, tap/drag placement, pause/preview clocks, durable reload, hints, exact replay, completion, attempts and Home persistence; four layouts.');
 }catch(e){await page.screenshot({path:path.join(out,'failure.png'),fullPage:true});throw e;}finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
