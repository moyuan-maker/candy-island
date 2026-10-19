t=open('web.tpl.html').read()
for k,f in [('CONTENT','core/content.js'),('ENGINE','core/engine.js'),('MASCOT','core/mascot.js'),('KEYS','core/keys.js')]:
    t=t.replace('/*@%s@*/'%k,open(f).read())
open('index.html','w').write(t)  # 测试脚本用
open('../index.html','w').write(t)  # GitHub Pages 发布用
print(len(t))
