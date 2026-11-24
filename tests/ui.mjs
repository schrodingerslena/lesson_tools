import {Window} from 'happy-dom';
import assert from 'node:assert/strict';
const w=new Window({url:'http://localhost/brawl-math/'});
w.document.body.innerHTML='<main id="app"></main>';
for(const k of ['window','document','location'])globalThis[k]=k==='window'?w:w[k];
await import('../brawl-math/app.mjs');
const $=s=>w.document.querySelector(s),click=s=>{assert.ok($(s),s);$(s).dispatchEvent(new w.MouseEvent('click',{bubbles:true}));},text=()=>$('#app').textContent;
function change(s,v){$(s).value=v;$(s).dispatchEvent(new w.Event('change'));}
async function nav(page){w.location.hash=page;await new Promise(r=>setTimeout(r,15));}
assert.ok(text().includes('Choose your arena'));
await nav('compare');for(let i=0;i<3;i++)click(`[data-pick="${i}"]`);click('#save');assert.ok(text().includes('1 unique teams'));assert.ok(text().includes('1 unique battle orders'));click('[data-left="0"]');click('#save');assert.ok(text().includes('1 unique teams'));assert.ok(text().includes('2 unique battle orders'));click('#allOrders');assert.equal(w.document.querySelectorAll('[data-arrange]').length,6);click('#reveal');assert.ok(text().includes('120 = 20 × 6'));
for(const page of ['team','duel','draft','showdown','knockout']){await nav(page);click('[data-mode="challenge"]');click('#hint');assert.equal($('#hintText').hidden,false);click('#solution');assert.equal($('#solutionText').hidden,false);click('#nextQuestion');click('[data-mode="teacher"]');click('#formulaToggle');assert.ok($('#reveal').textContent.includes('Hide'));assert.ok($('a[href="#"]'));}
await nav('draft');change('#rule','ban');change('#banCount','2');assert.equal(w.document.querySelectorAll('.brawler:disabled').length,2);change('#rule','category');change('[data-category="Tank"]','0');assert.ok(text().includes('Choose 2 Brawlers'));change('#rule','position');change('#position','last');click('#reveal');assert.ok(text().includes('last'));
await nav('showdown');change('#event','2');click('[data-run="10000"]');for(let i=0;i<200&&$('[data-run="10000"]').disabled;i++)await new Promise(r=>setTimeout(r,10));assert.ok($('.stats').textContent.includes('10,000'));assert.equal($('[data-run="10000"]').disabled,false);click('#reveal');assert.ok(text().includes('1/15'));assert.ok($('.chart'));
await nav('knockout');$('#roundP').value=60;$('#roundP').dispatchEvent(new w.Event('input'));click('[data-run="1000"]');for(let i=0;i<200&&$('[data-run="1000"]').disabled;i++)await new Promise(r=>setTimeout(r,10));assert.ok($('.stats').textContent.includes('1,000'));click('#reveal');assert.equal(w.document.querySelectorAll('.paths button').length,6);click('[data-path="WW"]');assert.ok($('#branchInfo').textContent.includes('9/25'));
await nav('team');click('[data-mode="teacher"]');change('#poolSize','6');click('[data-mode="challenge"]');$('#answer').value='20';$('#answerForm').dispatchEvent(new w.Event('submit',{cancelable:true}));
assert.equal($('#feedback').textContent,'Correct!');
console.log('DOM interaction tests passed: all modules, comparison, six orders, modes, draft settings, 10,000-match and 1,000-match experiments, tree paths, challenge submission.');
