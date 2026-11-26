import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createResponseMemory, resolveUnitResponse} from './unit-response-resolver.mjs';
const library = JSON.parse(fs.readFileSync(new URL('../../assets/audio/bibliotheque-reponses.json', import.meta.url)));
const base = {audioEnabled:true,voiceEnabled:true,language:'fr',nowRealSeconds:0,
  knownActors:{u:{controlled:true,known:true,availableForPresentation:true,responseProfile:'submarine'}}};
const selection = {kind:'selection',sourceEventId:'sel-1',actorId:'u',userInitiated:true};
const accepted = {kind:'accepted',sourceEventId:'receipt-1',actorId:'u',commandId:'cmd-1',
  receiptKnown:true,stage:'unit_received',orderType:'sonar'};
let passed=0;
function test(name, fn){fn();passed++;}
test('French fallback keeps matching subtitle and no English voice',()=>{
 const r=resolveUnitResponse(selection,base,createResponseMemory(),library);
 assert.equal(r.speech,null);assert.equal(r.subtitle.language,'fr');assert.ok(r.subtitle.text);
});
test('English uses existing voice clip',()=>{
 const r=resolveUnitResponse(selection,{...base,language:'en'},createResponseMemory(),library);
 assert.equal(r.speech.kind,'file');assert.ok(fs.existsSync(new URL('../../assets/audio/'+r.speech.file,import.meta.url)));
});
test('An explicit English voice choice can keep French translated subtitles',()=>{
 const r=resolveUnitResponse(selection,{...base,voiceLanguage:'en'},createResponseMemory(),library);
 assert.equal(r.speech.language,'en');assert.equal(r.subtitle.language,'fr');
});
test('Device speech requires available exact language and opt-in',()=>{
 const c={...base,allowDeviceSpeech:true,deviceVoiceLanguages:['fr']};
 assert.equal(resolveUnitResponse(selection,c,createResponseMemory(),library).speech.kind,'device_tts');
 assert.equal(resolveUnitResponse(selection,{...c,deviceVoiceLanguages:['en']},createResponseMemory(),library).speech,null);
});
test('Hover or rerender does not produce a unit acknowledgement',()=>{
 assert.equal(resolveUnitResponse({...selection,userInitiated:false},base,createResponseMemory(),library),null);
});
test('Enemy or uncontrolled selection does not reveal its voice',()=>{
 const c={...base,knownActors:{u:{...base.knownActors.u,controlled:false}}};
 assert.equal(resolveUnitResponse(selection,c,createResponseMemory(),library),null);
});
test('Unknown actor has no response',()=>{
 assert.equal(resolveUnitResponse({...selection,actorId:'secret'},base,createResponseMemory(),library),null);
});
test('Selecting an offline unit does not pretend to receive its live voice',()=>{
 const c={...base,knownActors:{u:{...base.knownActors.u,linkKnownUnavailable:true}}};
 const r=resolveUnitResponse(selection,c,createResponseMemory(),library);
 assert.equal(r.speech,null);assert.equal(r.speaker,'interface');assert.match(r.subtitle.text,/Dernier rapport/);
});
test('Repeated same unit selection is throttled',()=>{
 const m=createResponseMemory();assert.ok(resolveUnitResponse(selection,base,m,library));
 assert.equal(resolveUnitResponse({...selection,sourceEventId:'sel-2'},{...base,nowRealSeconds:1},m,library),null);
 assert.ok(resolveUnitResponse({...selection,sourceEventId:'sel-3'},{...base,nowRealSeconds:6},m,library));
});
test('Selection yields to critical presentation',()=>{
 assert.equal(resolveUnitResponse(selection,{...base,criticalPresentationPending:true},createResponseMemory(),library),null);
});
test('Clicking an order is not a received order',()=>{
 assert.equal(resolveUnitResponse({...accepted,stage:'client_validated',receiptKnown:false},base,createResponseMemory(),library),null);
});
test('Retransmitted receipt with same command is not replayed',()=>{
 const m=createResponseMemory();assert.ok(resolveUnitResponse(accepted,base,m,library));
 assert.equal(resolveUnitResponse({...accepted,sourceEventId:'relay-2'},base,m,library),null);
});
test('Queued command is spoken by command center and not the distant unit',()=>{
 const r=resolveUnitResponse({...accepted,kind:'queued',receiptKnown:false,stage:'pending'},base,createResponseMemory(),library);
 assert.equal(r.speaker,'command_center');assert.equal(r.phraseId,'status.queued');
});
test('Order acknowledgement does not confirm firing',()=>{
 const r=resolveUnitResponse({...accepted,orderType:'engage'},base,createResponseMemory(),library);
 assert.equal(r.doesNotConfirmExecution,true);assert.ok(!/fired|launched/i.test(r.subtitle.text));
});
test('A group produces one group voice plan',()=>{
 const r=resolveUnitResponse({...selection,isGroup:true},base,createResponseMemory(),library);
 assert.equal(r.profileId,'task_group');
});
test('Child unit receipts are suppressed for a group command',()=>{
 assert.equal(resolveUnitResponse({...accepted,groupCommandId:'group-1',isGroupSummary:false},base,createResponseMemory(),library),null);
});
test('Rejected orders have a refusal cue and no acceptance cue',()=>{
 const r=resolveUnitResponse({...accepted,kind:'rejected',receiptKnown:false},base,createResponseMemory(),library);
 assert.equal(r.sfxFile,library.assets.find(a=>a.id==='command_rejected').file);assert.equal(r.speaker,'command_center');
});
test('History reconstruction does not replay receipts',()=>{
 assert.equal(resolveUnitResponse(accepted,{...base,replayingHistory:true},createResponseMemory(),library),null);
});
test('Expired receipt is discarded',()=>{
 assert.equal(resolveUnitResponse({...accepted,expiresAtRealSeconds:0},base,createResponseMemory(),library),null);
});
test('Muting has no subtitle or audio side effect here',()=>{
 assert.equal(resolveUnitResponse(selection,{...base,audioEnabled:false},createResponseMemory(),library),null);
});
test('Resolver does not mutate actors, commands or catalogue',()=>{
 const before=JSON.stringify({base,accepted,library});
 resolveUnitResponse(accepted,base,createResponseMemory(),library);
 assert.equal(JSON.stringify({base,accepted,library}),before);
});
test('Variant rotation is separate from gameplay randomness',()=>{
 const old=Math.random;Math.random=()=>{throw Error('Gameplay RNG must not be touched');};
 try{const m=createResponseMemory();const a=resolveUnitResponse(selection,base,m,library);
 const b=resolveUnitResponse({...selection,sourceEventId:'sel-2'},{...base,nowRealSeconds:6},m,library);
 assert.notEqual(a.phraseId,b.phraseId);}finally{Math.random=old;}
});
console.log(JSON.stringify({resolverTestsPassed:passed,scope:'pure_resolver_only_not_live_browser_or_game'}));
