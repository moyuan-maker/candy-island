// 每条视频的脚本：钩子标题 + 一串镜头（act）+ 字幕。改这里就能批量出新视频。
const C = require('../../src/core/content.js');
const CTA = { act: 'cta' };
function day(n) {
  const lv = C.LEVELS[n - 1], st = C.STAGES[lv.stage], it = lv.items[0];
  const cnt = lv.items.length;
  return {
    id: 'day' + String(n).padStart(2, '0'), level: n,
    tag: `🍬 30天出国旅行口语 · Day ${n}`,
    hook: `今天学会说<br><em class="en">${it.en}</em>`,
    shots: [
      { act: 'result', cap: `Day ${n} 打卡 ✅ <em>${st.icon} ${st.name}</em>`, mood: 'love', hold: 2200 },
      { act: 'learn', cap: `<em>${it.en}</em> = ${it.short}`, after: '读对的单词会变绿 💚', mood: 'cheer' },
      { act: 'match', cap: '消消乐配对：英文 ↔ 中文 🍭', mood: 'wow' },
      { act: 'build', cap: '糖果拼句，一句一句拼出来', mood: 'think' },
      { act: 'finish', cap: `通关！今天又会说 <em>${cnt}</em> 句地道口语`, mood: 'love', hold: 2600 },
      CTA,
    ],
  };
}
const topics = [
  { id: 'q1-不敢开口', level: 2, tag: '🍬 女生开口说英语', hook: '英语口语<em>不敢开口</em>？<br>先让它给你打分',
    shots: [{ act: 'result', cap: '读完立刻出分，<em>3 颗星</em>✨', mood: 'love', hold: 2000 },
      { act: 'learn', cap: '糖豆先读一遍，你跟着读', after: '读对的词变绿，读错的变红', mood: 'cheer' },
      { act: 'learn2', cap: '一次一句，<em>不用背单词表</em>', after: '没人笑你，读到满意为止 💕', mood: 'happy' },
      { act: 'finish', cap: '10 分钟一关，<em>每天都敢开口</em>', mood: 'love', hold: 2400 }, CTA] },
  { id: 'q2-消消乐背口语', level: 3, tag: '🍬 边玩边学', hook: '像玩<em>消消乐</em>一样<br>背英语口语',
    shots: [{ act: 'result', cap: '玩着玩着就通关了 🎉', mood: 'love', hold: 2000 },
      { act: 'match', cap: '英文和中文配成一对就消掉', mood: 'wow' },
      { act: 'build', cap: '糖果拼句：把单词拼成一句话', mood: 'think' },
      { act: 'choose', cap: '听音选意，<em>练耳朵</em>', mood: 'cheer' },
      { act: 'finish', cap: '连击越多星星越多 ⭐⭐⭐', mood: 'love', hold: 2400 }, CTA] },
  { id: 'q3-30天后的你', level: 30, tag: '🍬 30天后的你', hook: '学完 30 关<br>我登上了<em>杂志封面</em>',
    shots: [{ act: 'cover', cap: '这是 30 天后的我 📸', mood: 'love', hold: 2600 },
      { act: 'map', cap: '巴黎 → 纽约 → 东京 → 伦敦 ✈️', mood: 'cheer' },
      { act: 'grad', cap: '最后一关：读出你的<em>英文 vlog 开场</em>', mood: 'wow' },
      { act: 'cover', cap: '生成专属封面，<em>放上你的照片</em>', mood: 'love', hold: 2600 }, CTA] },
  { id: 'q4-每天10分钟练什么', level: 1, tag: '🍬 女生开口说英语', hook: '每天 <em>10 分钟</em><br>练口语练什么？',
    shots: [{ act: 'result', cap: '一天一关，10 分钟搞定', mood: 'love', hold: 2000 },
      { act: 'learn', cap: '① 跟读 6 句博主口头禅', after: '读完马上打分 💯', mood: 'cheer' },
      { act: 'match', cap: '② 消消乐巩固意思', mood: 'wow' },
      { act: 'build', cap: '③ 拼句，把句子说完整', mood: 'think' },
      { act: 'future', cap: '30 天后：点咖啡、逛街、拍 vlog', mood: 'love' }, CTA] },
  { id: 'q5-9块9买断', level: 8, tag: '🍬 9.9 元一次买断', hook: '200 句<em>油管博主</em><br>地道口语，打包了',
    shots: [{ act: 'cover', cap: '终点奖励：你的杂志封面 ✨', mood: 'love', hold: 2200 },
      { act: 'map', cap: '30 关由易到难，5 个城市', mood: 'cheer' },
      { act: 'learn', cap: '每句都有中文和例句', after: '跟读打分，读对变绿 💚', mood: 'happy' },
      { act: 'match', cap: '玩消消乐顺便记住', mood: 'wow' }, CTA] },
];
module.exports = [...topics, ...Array.from({ length: 30 }, (_, i) => day(i + 1))];
