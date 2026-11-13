from PIL import Image, ImageDraw, ImageFont, ImageFilter
import random, glob
O='public/orn/'
def orn(n): return Image.open(O+n+'.webp').convert('RGBA')
def grad(w,h,c1,c2):
    im=Image.new('RGB',(w,h)); px=im.load()
    for y in range(h):
        t=y/(h-1)
        for x in range(w):
            u=(t*0.8+ x/(w-1)*0.2)
            px[x,y]=tuple(int(c1[i]*(1-u)+c2[i]*u) for i in range(3))
    return im
def paste_fit(base,im,cx,by,wid):
    s=wid/im.width; im=im.resize((int(im.width*s),int(im.height*s)),Image.LANCZOS)
    base.alpha_composite(im,(int(cx-im.width/2),int(by-im.height)))
def font(sz):
    for p in ['/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf','/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf']:
        try: return ImageFont.truetype(p,sz)
        except: pass
    return ImageFont.load_default()
def make(name,w,h,label,seed,pal,sub='Ganti dengan foto Anda'):
    random.seed(seed)
    base=grad(w,h,*pal).convert('RGBA')
    d=ImageDraw.Draw(base)
    # soft arch glow
    glow=Image.new('RGBA',(w,h),(0,0,0,0)); g=ImageDraw.Draw(glow)
    g.ellipse((w*0.12,h*0.08,w*0.88,h*0.86),fill=(255,250,238,120)); glow=glow.filter(ImageFilter.GaussianBlur(w*0.07)); base.alpha_composite(glow)
    base.alpha_composite(orn('sudut').transpose(Image.FLIP_LEFT_RIGHT).resize((int(w*.42),int(w*.42*580/718))),(0,h-int(w*.42*580/718)))
    paste_fit(base,orn('semak1'),w*0.5,h+8,w*1.05)
    for n,(cx,wid) in zip(random.sample(['buket1','buket3','buket2'],1),[(w*0.5,w*0.6)]): paste_fit(base,orn(n),cx,h*0.9,wid)
    paste_fit(base,orn(random.choice(['cloud1','cloud2'])),w*random.uniform(.3,.7),h*0.16,w*0.4)
    f=font(int(w*0.2)); tw=d.textlength(label,font=f)
    d=ImageDraw.Draw(base); d.text(((w-tw)/2,h*0.30),label,font=f,fill=(140,96,48,210))
    f2=font(int(w*0.034)); tw=d.textlength(sub,font=f2); d.text(((w-tw)/2,h*0.30+w*0.28),sub,font=f2,fill=(100,80,50,170))
    base.convert('RGB').save(f'public/demo/{name}.webp','WEBP',quality=80)
cream=((247,238,222),(226,214,184)); sage=((226,229,205),(176,186,146)); gold=((244,226,196),(214,176,120))
make('pria',800,1000,'A',1,sage); make('wanita',800,1000,'Z',2,cream)
specs=[('g1',800,1100,gold,'I'),('g2',1100,760,sage,'II'),('g3',860,860,cream,'III'),('g4',800,1000,sage,'IV'),('g5',1100,740,gold,'V'),('g6',800,1050,cream,'VI')]
for i,(n,w,h,p,l) in enumerate(specs): make(n,w,h,l,10+i,p,'Foto galeri contoh')
# OG image
W,H=1200,630
og=grad(W,H,(250,243,231),(232,216,188)).convert('RGBA')
paste_fit(og,orn('gapura'),W*0.5,H-20,H*0.88)
paste_fit(og,orn('lantern2'),W*0.12,H*0.62,H*0.62); paste_fit(og,orn('lantern1'),W*0.88,H*0.5,H*0.5)
paste_fit(og,orn('semak1'),W*0.2,H+4,520); paste_fit(og,orn('semak2'),W*0.82,H+4,420)
d=ImageDraw.Draw(og); f=font(34); t='The Wedding of'; d.text(((W-d.textlength(t,font=f))/2,40),t,font=f,fill=(140,96,48))
f=font(30); t='Abdillah  &  Zanila'; 
og2=Image.new('RGBA',(W,H),(0,0,0,0)); 
og.alpha_composite(og2)
d=ImageDraw.Draw(og); d.text(((W-d.textlength('A & Z',font=font(90)))/2,H*0.43),'A & Z',font=font(90),fill=(140,96,48))
og.convert('RGB').save('public/og.jpg','JPEG',quality=86)
