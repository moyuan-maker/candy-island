import re,json
Y='data/'
items=[];ch=None
for l in open(Y+'data.txt'):
    l=l.strip()
    if l.startswith('##'): ch=l[3:].split('｜')[0][3:];continue
    if '||' in l:
        en,zh,ex,exzh=[x.strip() for x in l.split('||')]
        items.append(dict(en=en,zh=zh,ex=ex,exzh=exzh,scene=ch))
gloss={}
for l in open(Y+'gloss.txt'):
    p=l.strip().split('|')
    if len(p)==3: gloss[p[0].lower()]=p
W=lambda s:re.findall(r"[A-Za-z][A-Za-z'\-]*",s)
def diff(it):
    w=W(it['en']); e=W(it['ex'])
    d=len(w)*10+sum(6 for x in w if len(x)>7)+sum(9 for x in w if x.lower() in gloss)
    if '...' in it['en'] or '…' in it['en']: d+=8
    d+=len(e)*0.8
    return d
for it in items: it['d']=diff(it)
items.sort(key=lambda x:x['d'])
if __name__=='__main__':
    for i,it in enumerate(items): print(i,round(it['d'],1),it['en'],'|',it['ex'])
