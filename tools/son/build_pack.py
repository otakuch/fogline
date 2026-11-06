#!/usr/bin/env python3
"""Prépare le pack audio de SEUIL : mp3 + son-pack.json (base64)."""
import subprocess,base64,json,os,sys
D=sys.argv[1]; WS=D+'/work-shelter-public/web/public/audio/'; KIT=D+'/sfx-kit/sounds/'; CC=D+'/CC0-Public-Domain-Sounds/sci-fi-sounds/Audio/'
# nom: (source, début, durée ou None, canaux, débit, filtre)
N={
 'room':(WS+'amb_sala_control.ogg',0,None,2,72,''),
 'srv':(WS+'amb_servidores.ogg',0,None,2,72,''),
 'ops':(WS+'amb_centro_mando.ogg',0,None,2,80,''),
 'clk1':(KIT+'interface/click-mouse-soft.wav',0,None,1,64,''),
 'clk2':(KIT+'interface/click-button-soft.wav',0,None,1,64,''),
 'clk3':(KIT+'interface/click-toggle-soft.wav',0,None,1,64,''),
 'blip':(KIT+'digital/digital-blip-clear.wav',0,None,1,64,''),
 'scan':(KIT+'digital/digital-scan-subtle.wav',0,None,1,64,''),
 'proc':(KIT+'digital/digital-process-subtle.wav',0,None,1,64,''),
 'deny':(KIT+'digital/digital-denied.wav',0,None,1,64,''),
 'glit':(KIT+'digital/digital-glitch-subtle.wav',0,None,1,64,''),
 'intf':(KIT+'digital/digital-interference.wav',0,None,1,64,''),
 'drop':(KIT+'digital/digital-signal-drop.wav',0,None,1,64,''),
 'tune':(KIT+'digital/digital-radio.wav',0,None,1,64,''),
 'thud':(KIT+'impacts/impact-deep-soft.wav',0,None,1,64,''),
 'kbd':(KIT+'keyboard/keyboard-typing-steady-medium.wav',0,None,1,64,''),
 'tele':(WS+'amb_teletipo.ogg',0,9,1,56,'afade=t=in:st=0:d=0.2,afade=t=out:st=8.3:d=0.7'),
 'phon':(WS+'telefono_lejano.ogg',0,None,1,56,''),
 'cmp0':(CC+'computerNoise_000.ogg',0,None,1,64,''),
 'cmp1':(CC+'computerNoise_001.ogg',0,None,1,64,''),
 'cmp2':(CC+'computerNoise_002.ogg',0,None,1,64,''),
 'vox1':(WS+'voz_a_f01.ogg',0,None,1,48,''),
 'vox2':(WS+'voz_a_f03.ogg',0,None,1,48,''),
 'vox3':(WS+'voz_c_f01.ogg',0,None,1,48,''),
 'vox4':(WS+'voz_c_f03.ogg',0,None,1,48,''),
}
pack={};tot=0
for k,(src,ss,dur,ch,br,fl) in N.items():
    out='mp3/%s.mp3'%k
    cmd=['ffmpeg','-y','-v','error','-ss',str(ss)]+(['-t',str(dur)] if dur else [])+['-i',src,'-ac',str(ch),'-ar','44100']
    if fl:cmd+=['-af',fl]
    cmd+=['-c:a','libmp3lame','-b:a',f'{br}k',out]
    subprocess.check_call(cmd)
    b=open(out,'rb').read();tot+=len(b);pack[k]=base64.b64encode(b).decode()
    d=subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration','-of','csv=p=0',out]).decode().strip()
    print(k,d,len(b)//1024,'Ko')
json.dump(pack,open('son-pack.json','w'),separators=(',',':'))
print('total',tot//1024,'Ko, base64',os.path.getsize('son-pack.json')//1024,'Ko')
