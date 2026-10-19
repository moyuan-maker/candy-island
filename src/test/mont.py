import sys
from PIL import Image
fs=sys.argv[2:];ims=[Image.open(f) for f in fs]
h=max(i.height for i in ims);W=sum(i.width for i in ims)
o=Image.new('RGB',(W,h),'white');x=0
for i in ims:o.paste(i,(x,0));x+=i.width
o=o.resize((o.width//2,o.height//2));o.save(sys.argv[1])
