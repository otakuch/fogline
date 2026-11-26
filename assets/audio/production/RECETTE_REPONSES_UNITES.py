from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
import json, wave, hashlib, subprocess, tempfile, shutil
import numpy as np
from scipy.signal import butter,sosfilt

ROOT=Path.cwd()
OUT=ROOT/'FOGLINE_REPONSES_UNITES_V1'
OUT.mkdir(exist_ok=True)
(OUT/'sfx').mkdir(exist_ok=True)
(OUT/'vo/en').mkdir(parents=True,exist_ok=True)
SR=48000
rng=np.random.default_rng(2611202602)

profiles=[
 ('surface','Navires de guerre','Naval bridge','rms',420,
  [('Passerelle à l’écoute.','Bridge here.'),('Commandement naval à l’écoute.','Naval command listening.'),('Passerelle en ligne.','Bridge on the line.')],
  [('Ordre reçu en passerelle.','Bridge copies your order.'),('Bien reçu.','Order received.'),('Instruction reçue.','Instruction received.')]),
 ('submarine','Sous-marins','Submarine control room','awb',310,
  [('Central à l’écoute.','Control room listening.'),('Sous-marin en ligne.','Submarine on the line.'),('Central en ligne.','Submarine here.')],
  [('Ordre reçu au central.','Control room copies.'),('Bien reçu au central.','Order received.'),('Instruction reçue.','Instruction acknowledged.')]),
 ('helicopter','Hélicoptères','Helicopter crew','slt',670,
  [('Équipage à l’écoute.','Flight crew here.'),('Hélicoptère en ligne.','Helicopter listening.'),('Équipage en ligne.','Aircrew on the line.')],
  [('Ordre reçu par l’équipage.','Aircrew copies.'),('Instruction reçue.','Instruction received.'),('Bien reçu.','Order acknowledged.')]),
 ('maritime_patrol','Patrouille maritime','Maritime patrol crew','rms',580,
  [('Patrouille maritime à l’écoute.','Maritime patrol here.'),('Équipage de patrouille en ligne.','Patrol crew listening.'),('Avion de patrouille à l’écoute.','Patrol aircraft here.')],
  [('Mission reçue.','Assignment received.'),('Instruction reçue.','Patrol crew copies.'),('Bien reçu.','Order acknowledged.')]),
 ('fighter','Avions de combat','Combat aircraft crew','awb',810,
  [('Pilote à l’écoute.','Pilot listening.'),('Patrouille aérienne en ligne.','Flight on the line.'),('Appareil à l’écoute.','Flight here.')],
  [('Ordre reçu.','Flight copies.'),('Instruction reçue.','Instruction received.'),('Bien reçu.','Order acknowledged.')]),
 ('drone','Drones téléopérés','Remote operator','slt',920,
  [('Station de contrôle à l’écoute.','Remote station here.'),('Opérateur en ligne.','Operator on the line.'),('Contrôle drone à l’écoute.','Drone control listening.')],
  [('Commande reçue.','Command received.'),('Instruction reçue.','Remote station copies.'),('Ordre enregistré.','Order recorded.')]),
 ('special_forces','Forces spéciales','Special detachment','rms',490,
  [('Détachement à l’écoute.','Detachment here.'),('Chef d’équipe en ligne.','Team leader listening.'),('Équipe spéciale à l’écoute.','Special detachment here.')],
  [('Consigne reçue.','Instruction received.'),('Ordre reçu par l’équipe.','Team copies.'),('Bien reçu.','Order acknowledged.')]),
 ('ground','Unités terrestres','Ground unit','awb',390,
  [('Équipe terrestre à l’écoute.','Ground team here.'),('Chef de section en ligne.','Section leader listening.'),('Unité terrestre en ligne.','Ground unit on the line.')],
  [('Ordre reçu.','Ground team copies.'),('Consigne reçue.','Instruction received.'),('Bien reçu.','Order acknowledged.')]),
 ('cyber','Équipes cyber','Cyber analyst','slt',1050,
  [('Équipe cyber à l’écoute.','Cyber team here.'),('Analyste en ligne.','Analyst listening.'),('Cellule cyber en ligne.','Cyber station on the line.')],
  [('Tâche reçue.','Task received.'),('Instruction enregistrée.','Instruction recorded.'),('Consigne reçue.','Cyber team copies.')]),
 ('humanitarian','Secours et humanitaire','Relief coordination','slt',740,
  [('Coordination des secours à l’écoute.','Relief coordination here.'),('Équipe de secours en ligne.','Relief crew listening.'),('Équipe humanitaire à l’écoute.','Humanitarian team here.')],
  [('Mission reçue.','Assignment received.'),('Instruction reçue.','Relief crew copies.'),('Bien reçu.','Order acknowledged.')]),
 ('support','Réparation et soutien','Support crew','rms',530,
  [('Équipe de soutien à l’écoute.','Support crew here.'),('Équipe technique en ligne.','Repair station listening.'),('Soutien en ligne.','Support team on the line.')],
  [('Intervention reçue.','Task received.'),('Instruction reçue.','Support crew copies.'),('Bien reçu.','Order acknowledged.')]),
 ('task_group','Task groups','Group command','rms',620,
  [('Commandement du groupe à l’écoute.','Group command here.'),('Coordinateur du groupe en ligne.','Group coordinator listening.'),('Commandement du groupe en ligne.','Group command on the line.')],
  [('Ordre reçu pour le groupe.','Group command copies.'),('Instruction de groupe reçue.','Group order received.'),('Bien reçu.','Order acknowledged.')])]

assets=[];records=[];profile_records=[]
def write_wave(path,a):
    a=np.asarray(a,dtype=float)
    a-=a.mean()
    with wave.open(str(path),'wb') as w:
        w.setnchannels(1);w.setsampwidth(2);w.setframerate(SR)
        w.writeframes(np.rint(np.clip(a,-.98,.98)*32767).astype('<i2').tobytes())

for ix,(id,fr,en,voice,freq,sel,ack) in enumerate(profiles):
    for kind in ['selection','accepted']:
      for v in [1,2]:
        duration=.16 if kind=='selection' else .29
        n=int(SR*duration);t=np.arange(n)/SR
        f=freq*(1+.035*(v-1))
        x=np.sin(2*np.pi*f*t)*np.exp(-t*(28 if kind=='selection' else 18))
        if kind=='accepted':
            k=int(.12*SR);x[k:]+=.5*np.sin(2*np.pi*f*1.23*t[:-k])*np.exp(-t[:-k]*24)
        x+=.1*sosfilt(butter(2,[300,2800],btype='bandpass',fs=SR,output='sos'),rng.normal(size=n))*np.exp(-t*35)
        fade=min(int(.008*SR),n//2);x[:fade]*=np.linspace(0,1,fade);x[-fade:]*=np.linspace(1,0,fade)
        x*=.18/max(np.max(np.abs(x)),1e-9)
        aid=f'{id}_{kind}_{v:02d}';path=OUT/'sfx'/(aid+'.wav');write_wave(path,x)
        assets.append({'id':aid,'kind':'nonverbal','profile':id,'phase':kind,
                       'file':'sfx/'+path.name,'durationSeconds':duration,'bus':'ui',
                       'origin':'original_procedural_synthesis'})
    p={'id':id,'label':{'fr':fr,'en':en},'voiceModelPrototypeEn':voice,
       'selectionPhraseIds':[],'acceptedPhraseIds':[],
       'selectionSfx':[f'{id}_selection_01',f'{id}_selection_02'],
       'acceptedSfx':[f'{id}_accepted_01',f'{id}_accepted_02']}
    for kind,lines in [('selection',sel),('accepted',ack)]:
      for v,(frline,enline) in enumerate(lines,1):
        pid=f'{id}.{kind}.{v:02d}'
        records.append({'id':pid,'profile':id,'phase':kind,'text':{'fr':frline,'en':enline},
                        'voiceModel':voice,'audio':{'en':'vo/en/'+pid+'.wav','fr':None},
                        'status':'english_synthetic_prototype_french_script_only'})
        p['selectionPhraseIds' if kind=='selection' else 'acceptedPhraseIds'].append(pid)
    profile_records.append(p)

orders=[
 ('move',[('Route reçue.','Route received.'),('Cap demandé reçu.','Course order acknowledged.')]),
 ('patrol',[('Patrouille reçue.','Patrol order received.'),('Route de patrouille reçue.','Patrol route acknowledged.')]),
 ('escort',[('Mission d’escorte reçue.','Escort assignment received.'),('Ordre d’escorte reçu.','Escort order acknowledged.')]),
 ('observe',[('Observation demandée reçue.','Observation task received.'),('Mission de surveillance reçue.','Monitoring task acknowledged.')]),
 ('analyze',[('Demande d’analyse reçue.','Analysis request received.'),('Examen du contact demandé.','Contact review requested.')]),
 ('sonar',[('Ordre sonar reçu.','Sonar order received.'),('Demande acoustique reçue.','Acoustic task acknowledged.')]),
 ('depth',[('Consigne de profondeur reçue.','Depth order received.'),('Changement de profondeur reçu.','Depth change acknowledged.')]),
 ('buoy',[('Ordre de bouée reçu.','Buoy order received.'),('Déploiement de bouée demandé.','Buoy deployment acknowledged.')]),
 ('engage',[('Ordre d’engagement reçu.','Engagement order received.'),('Conditions d’engagement à vérifier.','Engagement conditions under review.')]),
 ('return',[('Ordre de retour reçu.','Return order received.'),('Route de retour reçue.','Recovery route acknowledged.')]),
 ('deploy',[('Ordre de déploiement reçu.','Deployment order received.'),('Demande de transfert reçue.','Transfer request acknowledged.')]),
 ('cyber',[('Tâche cyber reçue.','Cyber task received.'),('Mission d’analyse reçue.','Analysis assignment acknowledged.')])]
order_phrases={}
for order,lines in orders:
    order_phrases[order]=[]
    for i,(fr,en) in enumerate(lines,1):
        pid=f'order.{order}.{i:02d}'
        records.append({'id':pid,'profile':'command','phase':'accepted','orderType':order,
                        'text':{'fr':fr,'en':en},'voiceModel':'rms',
                        'audio':{'en':'vo/en/'+pid+'.wav','fr':None},
                        'status':'english_synthetic_prototype_french_script_only'})
        order_phrases[order].append(pid)
for id,fr,en in [
 ('queued','Ordre en attente de transmission.','Order queued. Awaiting transmission.'),
 ('rejected','Ordre indisponible. Vérifiez les conditions.','Order unavailable. Check requirements.'),
 ('busy','Unité occupée. Action non démarrée.','Unit occupied. Action not started.'),
 ('cancelled','Annulation de l’ordre reçue.','Order cancellation acknowledged.')]:
    records.append({'id':'status.'+id,'profile':'command','phase':id,
                    'text':{'fr':fr,'en':en},'voiceModel':'slt',
                    'audio':{'en':'vo/en/status.'+id+'.wav','fr':None},
                    'status':'english_synthetic_prototype_french_script_only'})

work=Path(tempfile.mkdtemp(prefix='unit_vo_work.',dir=ROOT))
def render_voice(item):
    txt=work/(item['id']+'.txt');raw=work/(item['id']+'.wav')
    txt.write_text(item['text']['en'])
    subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-f','lavfi','-i',
                    f"flite=textfile={txt}:voice={item['voiceModel']}",'-ar',str(SR),'-ac','1',str(raw)],check=True)
    with wave.open(str(raw),'rb') as w:a=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
    # Mild radio filtering; keep words intelligible, do not add constant static.
    a=sosfilt(butter(2,[180,4200],btype='bandpass',fs=SR,output='sos'),a)
    a*=.43/max(np.max(np.abs(a)),1e-9)
    fade=min(len(a)//2,int(.014*SR));a[:fade]*=np.linspace(0,1,fade);a[-fade:]*=np.linspace(1,0,fade)
    a=np.pad(a,(int(.035*SR),int(.07*SR)))
    path=OUT/item['audio']['en'];write_wave(path,a)
    return {'id':item['id'],'kind':'voice','language':'en','profile':item['profile'],
            'phase':item['phase'],'file':item['audio']['en'],'durationSeconds':len(a)/SR,
            'bus':'comms','origin':'generic_flite_speech_synthesis_not_human_recording'}
with ThreadPoolExecutor(max_workers=4) as pool:
    assets.extend(list(pool.map(render_voice,records)))
shutil.rmtree(work)
for id,freq,duration in [('command_pending',350,.28),('command_rejected',220,.32)]:
    t=np.arange(int(duration*SR))/SR
    a=np.sin(2*np.pi*freq*t)*np.exp(-t*17)
    a[:int(.01*SR)]*=np.linspace(0,1,int(.01*SR))
    a[-int(.03*SR):]*=np.linspace(1,0,int(.03*SR))
    a*=.16/max(np.max(np.abs(a)),1e-9)
    path=OUT/'sfx'/(id+'.wav');write_wave(path,a)
    assets.append({'id':id,'kind':'nonverbal','profile':'command','phase':id,
                   'file':'sfx/'+path.name,'durationSeconds':duration,'bus':'ui',
                   'origin':'original_procedural_synthesis'})
assert len(records)==100 and len(assets)==150

for a in assets:
    p=OUT/a['file'];a['sha256']=hashlib.sha256(p.read_bytes()).hexdigest()
catalog={'schemaVersion':1,'status':'asset_library_ready_game_integration_pending',
         'date':'2026-11-26','profiles':profile_records,'orderPhraseIds':order_phrases,
         'phrases':records,'assets':assets,
         'statusSfx':{'queued':'command_pending','rejected':'command_rejected','busy':'command_rejected','cancelled':'command_pending'},
         'counts':{'profiles':12,'nonverbalClips':50,
         'englishSyntheticVoiceClips':100,'frenchRecordedClips':0,'bilingualTexts':100},
         'notHumanVoiceActing':True,'gameRuntimeIntegrated':False,
         'languagePolicy':'Exact-language asset, optional device TTS, otherwise signature plus subtitle; never silently use English audio for French text.'}
(OUT/'bibliotheque-reponses.json').write_text(json.dumps(catalog,ensure_ascii=False,indent=2)+'\n')

demo=np.zeros(50*SR)
timeline=[]
example_profiles=['surface','submarine','helicopter','maritime_patrol','fighter','special_forces','cyber','humanitarian']
for i,p in enumerate(example_profiles):
    start=1+i*6
    for phase,at in [('selection',start),('accepted',start+2.8)]:
        s=next(a for a in assets if a['id']==f'{p}_{phase}_01')
        v=next(a for a in assets if a['id']==f'{p}.{phase}.01')
        for a,g,offset in [(s,.6,0),(v,1,.18)]:
            with wave.open(str(OUT/a['file']),'rb') as w:x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
            k=int((at+offset)*SR);n=min(len(x),len(demo)-k)
            if n>0:demo[k:k+n]+=g*x[:n]
        timeline.append({'atSeconds':at,'profile':p,'phase':phase,'phraseId':v['id']})
demo*=.75/max(np.max(np.abs(demo)),1e-9)
raw=OUT/'demo_source.wav';write_wave(raw,demo)
mp3=ROOT/'FOGLINE_DEMO_REPONSES_UNITES_V1.mp3'
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(raw),
                '-af','loudnorm=I=-22:TP=-1.5:LRA=7','-codec:a','libmp3lame','-b:a','160k',str(mp3)],check=True)
shutil.copyfile(mp3,OUT/mp3.name);raw.unlink()
(OUT/'chronologie-demo.json').write_text(json.dumps({'durationSeconds':50,'voiceLanguage':'en','events':timeline},ensure_ascii=False,indent=2)+'\n')
print(json.dumps({'clips':len(assets),'phrases':len(records),'profiles':12,'demo':str(mp3)},ensure_ascii=False))
