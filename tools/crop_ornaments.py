import numpy as np, cv2, sys, json
from PIL import Image
from skimage import color
from scipy import ndimage as ndi

SRC='/mnt/user-data/uploads/Javanese_Heritage_Ornament_Collection.png'
rgb=np.array(Image.open(SRC).convert('RGBA'))[...,:3]
H,W,_=rgb.shape

# name: (x0,y0,x1,y1, tol_lo, tol_hi)
BOX={
 'gunungan':(5,20,365,545,9,20),
 'cloud1':(278,35,595,160,9,18),
 'cloud2':(360,168,575,250,9,18),
 'cloud3':(372,292,565,370,9,18),
 'gapura':(520,10,1105,530,9,20),
 'lantern1':(1100,0,1215,275,9,18),
 'lantern2':(1225,0,1340,365,9,18),
 'payung':(1345,28,1510,435,9,18),
 'daun':(1030,225,1290,505,8,16),
 'buket1':(15,545,320,755,7,15),
 'buket2':(312,465,575,785,7,15),
 'buket3':(598,520,965,885,7,15),
 'semak1':(15,735,765,995,7,15),
 'semak2':(780,780,1085,990,7,15),
 'bunga_semak':(1205,415,1520,700,7,15),
 'sudut':(1170,705,1545,995,14,28),
 'f1':(955,535,1030,630,6,13),
 'f2':(1070,530,1235,665,6,13),
 'f3':(975,630,1065,745,6,13),
 'f4':(1185,630,1270,720,6,13),
 'f5':(1030,730,1130,830,6,13),
 'f6':(1145,720,1230,830,6,13),
 'f7':(1240,715,1330,860,6,13),
 'f8':(1090,830,1235,970,6,13),
}
GROUP={'semak1':10,'semak2':10,'buket3':8,'buket2':8,'buket1':8,'bunga_semak':8}
def cut(name,pad=0):
    x0,y0,x1,y1,tl,th=BOX[name]
    c=rgb[y0:y1,x0:x1].astype(np.float32)/255
    lab=color.rgb2lab(c)
    ring=np.concatenate([lab[0],lab[-1],lab[:,0],lab[:,-1]])
    # bg color: median of ring pixels (cream) - restrict to light ones
    ring=ring[ring[:,0]>80]
    bg=np.median(ring,axis=0)
    # local bg field: blur of bg-like pixels to handle vignette
    d=np.linalg.norm(lab-bg,axis=2)
    bgmask=d<tl
    # connected to border
    lbl,n=ndi.label(bgmask)
    border=set(np.unique(np.concatenate([lbl[0],lbl[-1],lbl[:,0],lbl[:,-1]])))-{0}
    conn=np.isin(lbl,list(border))
    # alpha: pixels in conn -> 0 ; others by soft ramp near conn
    near=ndi.binary_dilation(conn,iterations=2)
    ramp=np.clip((d-tl)/(th-tl),0,1)
    a=np.ones_like(d)
    a[conn]=0
    edge=near&~conn
    a[edge]=ramp[edge]
    a=cv2.GaussianBlur(a,(0,0),0.6)
    a[conn&(d<tl*0.6)]=0
    # remove tiny specks
    solid=(a>0.5).astype(np.uint8)
    n2,l2,st,_=cv2.connectedComponentsWithStats(solid,connectivity=8)
    keep=np.zeros(n2,bool); keep[1:]=st[1:,cv2.CC_STAT_AREA]>=25
    a[~keep[l2]]=0
    # keep only the main group (dilate to merge petals/leaves, drop neighbour fragments)
    solid=(a>0.3).astype(np.uint8)
    k=GROUP.get(name,6)
    dil=cv2.dilate(solid,np.ones((2*k+1,2*k+1),np.uint8))
    n3,l3,st3,_=cv2.connectedComponentsWithStats(dil,connectivity=8)
    if n3>2:
        big=1+np.argmax(st3[1:,cv2.CC_STAT_AREA])
        a[l3!=big]=0
    # decontaminate
    bgrgb=color.lab2rgb(bg[None,None,:])[0,0]
    aa=np.maximum(a,1e-3)[...,None]
    out=(c-(1-aa)*bgrgb)/aa
    out=np.clip(out,0,1)
    out[a<0.02]=0
    res=np.dstack([out,a]); res=(res*255).astype(np.uint8)
    im=Image.fromarray(res,'RGBA')
    bb=im.getchannel('A').point(lambda v:255 if v>8 else 0).getbbox()
    if bb: im=im.crop(bb)
    return im
if __name__=='__main__':
    names=sys.argv[1:] or list(BOX)
    for n in names:
        im=cut(n); im.save(f'/home/claude/raw/{n}.png'); print(n,im.size)
