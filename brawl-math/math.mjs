export function integer(n){if(!Number.isSafeInteger(n)||n<0||n>1000)throw new RangeError('Use an integer from 0 to 1000.');return n;}
export function factorial(n){integer(n);let v=1n;for(let i=2;i<=n;i++)v*=BigInt(i);return v;}
export function permutation(n,r){integer(n);integer(r);return r>n?0n:factorial(n)/factorial(n-r);}
export function combination(n,r){integer(n);integer(r);return r>n?0n:permutation(n,r)/factorial(r);}
export function fraction(n,d=1n){n=BigInt(n);d=BigInt(d);if(d===0n)throw new RangeError('Zero denominator');if(d<0n){n=-n;d=-d;}let a=n<0n?-n:n,b=d;while(b)[a,b]=[b,a%b];return {n:n/a,d:d/a};}
export function probability(n,d){if(BigInt(n)<0n||BigInt(n)>BigInt(d)||BigInt(d)<=0n)throw new RangeError('Invalid probability');return fraction(n,d);}
export function complement(f){return probability(f.d-f.n,f.d);}
export function experimental(success,trials){if(!Number.isSafeInteger(trials)||!Number.isSafeInteger(success)||trials<0||success<0||success>trials)throw new RangeError('Invalid experiment');return trials===0?null:probability(success,trials);}
export function probabilityText(f){if(!f)return '—';return `${f.n}${f.d===1n?'':'/'+f.d} ≈ ${(100*Number(f.n)/Number(f.d)).toFixed(2)}%`;}
export function combinations(a,r){if(r===0)return [[]];if(r>a.length||r<0)return [];return a.flatMap((v,i)=>combinations(a.slice(i+1),r-1).map(t=>[v,...t]));}
export function arrangements(a){return a.length?a.flatMap((v,i)=>arrangements(a.filter((_,j)=>j!==i)).map(t=>[v,...t])):[[]];}
export const teamKey=a=>[...a].sort().join('|');
export const orderKey=a=>a.join('|');
export function validTeam(team,{banned=[],required=[],incompatible=[],categories=null,position=null}={}){if(new Set(team.map(b=>b.id)).size!==team.length)return false;const ids=team.map(b=>b.id);return !ids.some(id=>banned.includes(id))&&required.every(id=>ids.includes(id))&&!incompatible.some(pair=>pair.every(id=>ids.includes(id)))&&(!categories||Object.entries(categories).every(([c,n])=>team.filter(b=>b.category===c).length===n))&&(!position||team[position.index]?.id===position.id);}
export function countRestricted(pool,size,rules={},ordered=false){return BigInt(combinations(pool,size).flatMap(t=>ordered?arrangements(t):[t]).filter(t=>validTeam(t,rules)).length);}
// Rejection sampling avoids modulo bias; Fisher–Yates makes each ranking equally likely.
export function randomInt(n){if(!Number.isInteger(n)||n<1||n>4294967296)throw new RangeError('Invalid random range');const limit=Math.floor(4294967296/n)*n;const a=new Uint32Array(1);do{globalThis.crypto.getRandomValues(a);}while(a[0]>=limit);return a[0]%n;}
export function shuffle(a,rng=randomInt){a=[...a];for(let i=a.length-1;i>0;i--){const j=rng(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
export const showdownEvents=['Shelly first','Shelly in top three','Shelly and Colt both in top three','At least one of Shelly and Colt in top three'];
export function showdownSuccess(ranking,event){const top=ranking.slice(0,3);return [ranking[0]===0,top.includes(0),top.includes(0)&&top.includes(1),top.includes(0)||top.includes(1)][event];}
export function showdownProbability(event){return [probability(1,10),probability(3,10),probability(combination(8,1),combination(10,3)),complement(probability(combination(8,3),combination(10,3)))][event];}
export function knockoutProbability(p){if(!Number.isFinite(p)||p<0||p>1)throw new RangeError('Invalid round probability');return p*p+2*p*p*(1-p);}
export function knockout(p,rng=Math.random){knockoutProbability(p);let wins=0,losses=0,path='';while(wins<2&&losses<2){if(rng()<p){wins++;path+='W';}else{losses++;path+='L';}}return {win:wins===2,path};}
export function numericalAnswer(s){s=String(s).trim();if(s.endsWith('%'))return numericalAnswer(s.slice(0,-1))/100;if(/^[+-]?\d+(?:\.\d+)?\s*\/\s*[+-]?\d+(?:\.\d+)?$/.test(s)){const [a,b]=s.split('/').map(Number);return b===0?NaN:a/b;}return /^[+-]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(s)?Number(s):NaN;}
