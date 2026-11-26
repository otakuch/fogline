from pathlib import Path
import json, wave, hashlib, subprocess, shutil
import numpy as np
from scipy.signal import butter, sosfilt

ROOT=Path.cwd()
OUT=ROOT/'FOGLINE_ENVIRONNEMENT_SONORE_V1'
ASSETS=OUT/'audio'
ASSETS.mkdir(parents=True,exist_ok=True)
SR=48000
rng=np.random.default_rng(26112026)
bank={}
assets=[]

def filt(x,lo,hi):
    return sosfilt(butter(3,[lo,hi],btype='bandpass',fs=SR,output='sos'),x)

def noise(n,lo=100,hi=3500):
    a=filt(rng.normal(0,1,n),lo,hi)
    return a/max(np.max(np.abs(a)),1e-9)

def envelope(n,attack=.01,release=.1):
    e=np.ones(n)
    a=min(n//2,max(2,int(attack*SR)));b=min(n//2,max(2,int(release*SR)))
    e[:a]=np.sin(np.linspace(0,np.pi/2,a))**2
    e[-b:]=np.cos(np.linspace(0,np.pi/2,b))**2
    return e

def tone(dur,freq=620,decay=4,glide=0):
    t=np.arange(int(dur*SR))/SR
    phase=2*np.pi*(freq*t+glide*t*t/2)
    return np.sin(phase)*np.exp(-decay*t)*envelope(len(t),.012,min(.15,dur/4))

def echo(x,delays=(.16,.31),gains=(.18,.07)):
    y=x.copy()
    for d,g in zip(delays,gains):
        k=int(d*SR)
        if k<len(x): y[k:]+=g*x[:-k]
    return y

def phrase(segments,duration):
    y=np.zeros(int(SR*duration))
    for start,part,g in segments:
        k=int(start*SR);n=min(len(part),len(y)-k)
        if n>0:y[k:k+n]+=g*part[:n]
    return y

def periodic_texture(duration,lo,hi):
    n=int(duration*SR)
    f=np.fft.rfftfreq(n,1/SR)
    shape=np.zeros_like(f)
    keep=(f>=lo)&(f<=hi)
    shape[keep]=(f[keep]/max(lo,1))**(-.75)
    edge=max(10,(hi-lo)*.12)
    shape*=np.minimum(np.clip((f-lo)/edge,0,1),np.clip((hi-f)/edge,0,1))
    z=(rng.normal(size=len(f))+1j*rng.normal(size=len(f)))*shape
    a=np.fft.irfft(z,n=n)
    return a/max(np.sqrt(np.mean(a*a)),1e-12)

def stereo(a,width=.06):
    shift=int(SR*.007)
    side=np.roll(a,shift)-np.roll(a,-shift)
    return np.column_stack([a+width*side,a-width*side])

def save(id,label,bus,data,peak_db,loop=False,event=None,description=''):
    a=np.asarray(data,dtype=np.float64)
    if a.ndim==1:a=stereo(a,.025)
    a-=np.mean(a,axis=0)
    a*=10**(peak_db/20)/max(np.max(np.abs(a)),1e-12)
    if not loop:a*=envelope(len(a),.004,.035)[:,None]
    a=np.clip(a,-.97,.97)
    path=ASSETS/(id+'.wav')
    pcm=np.rint(a*32767).astype('<i2')
    with wave.open(str(path),'wb') as w:
        w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(pcm.tobytes())
    bank[id]=a
    assets.append({'id':id,'label':label,'file':'audio/'+path.name,'bus':bus,
                   'durationSeconds':round(len(a)/SR,4),'sampleRate':SR,'channels':2,
                   'format':'PCM16_WAV','loop':loop,'trigger':event,
                   'description':description,'origin':'original_procedural_synthesis',
                   'sha256':hashlib.sha256(path.read_bytes()).hexdigest()})

D=20
t=np.arange(D*SR)/SR
room=periodic_texture(D,80,1100)*.16
room+=.16*np.sin(2*np.pi*75*t)+.045*np.sin(2*np.pi*150*t)
room*=1+.06*np.sin(2*np.pi*.1*t)
save('amb_ops_room','Salle d’opérations','ambience',stereo(room),-17,True,
     description='Ventilation et résonance discrètes ; aucun message tactique intelligible.')
sea=periodic_texture(D,120,4200)*(.16+.055*np.sin(2*np.pi*.1*t)+.025*np.sin(2*np.pi*.15*t))
save('amb_open_sea','Mer et souffle extérieur','ambience',stereo(sea,.1),-17,True,
     description='Souffle maritime stylisé ; boucle périodique sans prise de son empruntée.')
under=periodic_texture(D,45,750)*.12+.04*np.sin(2*np.pi*53*t)
save('amb_underwater','Écoute sous-marine stylisée','ambience',stereo(under,.025),-19,True,
     description='Texture filtrée fictive ; ne simule pas la signature d’un sous-marin réel.')
tension=np.zeros_like(t)
for f,g in [(98,.09),(146.5,.042),(196,.018)]:
    tension+=g*np.sin(2*np.pi*f*t+.16*np.sin(2*np.pi*.1*t))
tension*=.8+.2*np.sin(2*np.pi*.15*t)
tension+=periodic_texture(D,140,1800)*.013
save('amb_tension','Tension retenue','music',stereo(tension,.025),-18,True,
     description='Nappe musicale originale sans motif mélodique repris de la référence.')

save('ui_select','Sélection','ui',tone(.11,980,37)+.13*noise(int(.11*SR),600,3500)*envelope(int(.11*SR),.004,.04),-16,event='ui.selection.changed')
save('ui_order_ack','Ordre reçu','ui',phrase([(0,tone(.2,540,17),1),(.105,tone(.2,710,17),.6)],.34),-13,event='event.order.accepted')
save('ui_unavailable','Ordre indisponible','ui',tone(.3,210,16)+.18*tone(.3,370,17),-14,event='ui.order.rejected')
save('radio_open','Ouverture radio','comms',noise(int(.2*SR),500,2700)*envelope(int(.2*SR),.012,.09),-17,event='presentation.radio.begin')
save('radio_close','Fermeture radio','comms',phrase([(0,noise(int(.1*SR),500,2200)*envelope(int(.1*SR),.015,.035),.8),(.09,tone(.12,360,25),.2)],.24),-17,event='presentation.radio.end')
save('sonar_emit','Ping émis','sonar',echo(tone(1.9,710,2.5,-18)), -10,event='knowledge.ownSonarEmission')
save('sonar_contact','Nouvel écho reçu','sonar',phrase([(0,tone(.38,430,8),1),(.17,tone(.4,480,9),.32)],.65),-12,event='knowledge.acousticObservation.delivered')
save('classification_update','Analyse mise à jour','comms',phrase([(0,tone(.2,520,15),.7),(.15,tone(.27,650,12),.7)],.5),-13,event='knowledge.classification.changed')
save('crisis_attention','Nouvelle crise','alerts',phrase([(0,tone(.45,470,5),1),(.43,tone(.52,570,6),.85)],1.15),-10,event='event.crisis.created')
save('crisis_critical','Urgence critique','alerts',phrase([(0,tone(.35,620,5),1),(.37,tone(.35,620,5),.85),(.74,tone(.53,770,5),.72)],1.5),-9,event='knowledge.crisis.severityRaised')
x=noise(int(2.2*SR),160,3200);q=np.arange(len(x))/SR
save('missile_launch','Départ de missile observé','weapons',x*(1-np.exp(-q*12))*np.exp(-q*2.5)+.12*tone(2.2,110,2,-12),-12,event='knowledge.weaponLaunch.missile')
x=noise(int(1.8*SR),90,2500);q=np.arange(len(x))/SR
save('torpedo_release','Largage de torpille','weapons',x*np.exp(-q*3)*envelope(len(x),.05,.3)+.18*tone(1.8,170,8,-20),-12,event='knowledge.weaponLaunch.torpedo')
x=noise(int(2.4*SR),70,1100);q=np.arange(len(x))/SR
save('impact_observed','Impact signalé','weapons',x*np.exp(-q*3)+.15*tone(2.4,66,3,-4),-11,event='knowledge.impact.observed')
save('unit_damage','Avarie signalée','alerts',phrase([(0,tone(.6,190,5),.8),(.19,tone(.6,280,7),.5)],.9),-12,event='knowledge.friendlyDamage.delivered')
save('mission_resolved','Situation stabilisée','comms',phrase([(0,tone(.9,390,3),.55),(.25,tone(1,490,3),.32),(.5,tone(1,585,3),.17)],1.65),-14,event='knowledge.objective.resolved')
x=noise(int(.8*SR),550,2800);q=np.arange(len(x))/SR
save('comms_degraded','Liaison dégradée','comms',x*(.25+.75*(np.sin(2*np.pi*9*q)>0))*envelope(len(x),.025,.2),-15,event='knowledge.link.degraded')

manifest={'schemaVersion':1,'status':'original_audio_prototype_not_integrated',
          'date':'2026-11-26','referenceVideo':'https://www.youtube.com/watch?v=msj-iui56so',
          'referenceAudioDirectlyAuditioned':False,'referenceSamplesUsed':False,
          'realMilitarySignatureSimulation':False,'assets':assets,
          'productionNote':'Maquettes de synthèse à valider à l’écoute ; voix radio fournies comme scripts séparés, sans enregistrement vocal.'}
(OUT/'catalogue-audio.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')

mix=np.zeros((60*SR,2))
def add(id,start,gain=1):
    a=bank[id];k=int(start*SR);n=min(len(a),len(mix)-k)
    if n>0:mix[k:k+n]+=a[:n]*gain
def loopbed(id,start,end,gain):
    a=bank[id];k0=int(start*SR);k1=int(end*SR);n=k1-k0
    tiled=np.tile(a,(int(np.ceil(n/len(a))),1))[:n].copy()
    tiled*=envelope(n,.8,1.2)[:,None]
    mix[k0:k1]+=gain*tiled
loopbed('amb_ops_room',0,60,.55)
loopbed('amb_open_sea',0,17,.25)
loopbed('amb_underwater',12,36,.3)
loopbed('amb_tension',30,53,.35)
timeline=[
 (4,'ui_select',.75,'Sélection d’une unité'),
 (7,'ui_order_ack',.75,'Ordre reçu'),
 (9,'radio_open',.5,'Texture radio, sans voix'),(9.7,'radio_close',.5,'Fin de texture radio'),
 (13.5,'sonar_emit',.65,'Ping réellement émis dans la scène fictive'),
 (16.5,'sonar_contact',.7,'Écho reçu ; identité encore inconnue'),
 (23,'classification_update',.75,'Analyse actualisée'),
 (29,'comms_degraded',.55,'Liaison dégradée signalée'),
 (33,'crisis_attention',.75,'Ouverture d’une crise'),
 (37,'missile_launch',.6,'Départ observé de missile'),
 (41,'torpedo_release',.65,'Largage de torpille'),
 (45,'impact_observed',.65,'Impact signalé'),
 (48,'crisis_critical',.7,'Aggravation connue de la crise'),
 (54,'mission_resolved',.8,'Situation stabilisée')]
for start,id,gain,label in timeline:add(id,start,gain)
mix*=envelope(len(mix),1.8,2.3)[:,None]
mix*=.7/max(np.max(np.abs(mix)),1e-9)
raw=OUT/'demo-mix-source.wav'
with wave.open(str(raw),'wb') as w:
    w.setnchannels(2);w.setsampwidth(2);w.setframerate(SR);w.writeframes(np.rint(mix*32767).astype('<i2').tobytes())
demo=ROOT/'FOGLINE_MAQUETTE_SONORE_V1.mp3'
subprocess.run(['ffmpeg','-y','-hide_banner','-loglevel','error','-i',str(raw),'-af','loudnorm=I=-22:TP=-1.5:LRA=7','-ar','48000','-codec:a','libmp3lame','-b:a','192k',str(demo)],check=True)
shutil.copyfile(demo,OUT/demo.name)
raw.unlink()
(OUT/'CHRONOLOGIE_DEMO.txt').write_text('FOGLINE — Maquette originale de 60 secondes\nAucun extrait de la vidéo ; aucune voix enregistrée.\n\n'+ '\n'.join(f'{sec:05.1f} s — {label}' for sec,id,gain,label in timeline)+'\n')
print(json.dumps({'assets':len(assets),'demo':str(demo),'demoBytes':demo.stat().st_size,'durationSeconds':60},ensure_ascii=False))
