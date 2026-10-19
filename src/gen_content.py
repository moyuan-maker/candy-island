import re,json
from grade import items,gloss,W
Y='data/'
tips=[l.strip().split('|',1) for l in open(Y+'tips.txt') if '|' in l]
sizes=[6]*10+[7]*20
STAGES=[
 dict(name='巴黎咖啡馆',en='Paris Café',icon='🥐',color='#ff8fb8',from_=1,to=6,read='phrase',
      unlock='听懂博主嘴边的口头禅',detail='坐在街角咖啡馆，邻桌女生说“No way”“Literally”时，你会心一笑。'),
 dict(name='纽约逛街',en='New York',icon='🛍️',color='#ffa63d',from_=7,to=12,read='phrase',
      unlock='和朋友聊天，地道短语脱口而出',detail="逛街试衣服，“I'm obsessed”“What a steal”张口就来。"),
 dict(name='东京旅行',en='Tokyo Trip',icon='🗼',color='#4fb8ff',from_=13,to=18,read='phrase',
      unlock='旅行时点餐、问路、聊天不卡壳',detail='一个人旅行也不慌，自己问路、点单、和店员聊两句。'),
 dict(name='伦敦下午茶',en='London Tea',icon='🫖',color='#5ccf7a',from_=19,to=24,read='example',
      unlock='一口气说完整句，语调越来越像博主',detail='开始读博主原句长度的句子，连读和节奏都更自然。'),
 dict(name='主角时刻',en='Main Character',icon='🎬',color='#a77bff',from_=25,to=30,read='example',
      unlock='拍下你的第一条英文 vlog',detail='对着镜头用英语说 30 秒，做自己生活的女主角。'),
]
def short(zh): return re.split(r'[（(]',zh)[0].strip()
def say(en): return re.sub(r'\s*(\.\.\.|…)\s*$','',en).strip()
levels=[];k=0
for i,n in enumerate(sizes):
    lvno=i+1
    st=next(j for j,s in enumerate(STAGES) if s['from_']<=lvno<=s['to'])
    its=[]
    for it in items[k:k+n]:
        its.append(dict(en=it['en'],say=say(it['en']),zh=it['zh'],short=short(it['zh']),ex=it['ex'],exzh=it['exzh'],scene=it['scene']))
    k+=n
    levels.append(dict(id=lvno,stage=st,boss=lvno%6==0,items=its,tip=dict(t=tips[i][0],b=tips[i][1])))
assert k==200
for s in STAGES: s['from']=s.pop('from_')
G={w:[p[1],p[2]] for w,p in gloss.items()}
MOODS=[
 dict(e='😆',t='开心到飞起',rate=1.1,pitch=1.6),
 dict(e='🤫',t='说悄悄话',rate=0.85,pitch=1.0,vol=0.35),
 dict(e='🤖',t='像个机器人',rate=0.7,pitch=0.3),
 dict(e='😴',t='刚刚睡醒',rate=0.62,pitch=0.8),
 dict(e='🎙️',t='像新闻主播',rate=0.92,pitch=1.0),
 dict(e='😤',t='有点小生气',rate=1.15,pitch=0.85),
 dict(e='🥺',t='撒个娇',rate=0.88,pitch=1.7),
 dict(e='🕵️',t='神秘侦探',rate=0.8,pitch=0.7),
]
GRAD=["Hey guys, welcome back to my channel.","Quick life update: I'm learning English!","Not gonna lie, it was hard at first.","But honestly, I'm obsessed now.","Let me know in the comments what you think.","Take care, and see you in the next one."]
GRADZH=["嗨大家好，欢迎回到我的频道。","近况速报：我在学英语！","说实话，一开始挺难的。","但现在我真的超爱。","在评论区告诉我你们的想法吧。","保重，下期见！"]
out=dict(STAGES=STAGES,LEVELS=levels,GLOSS=G,MOODS=MOODS,GRAD=GRAD,GRADZH=GRADZH)
js='/* 口语糖果岛 内容数据（网页版与小程序共用）*/\nvar CONTENT = '+json.dumps(out,ensure_ascii=False)+';\nif (typeof module !== "undefined") module.exports = CONTENT;\n'
open('core/content.js','w').write(js)
for l in levels: print(l['id'],l['stage'],[x['say'] for x in l['items']])
