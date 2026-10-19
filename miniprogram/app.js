// 口语糖果岛 小程序入口
App({
  globalData: { buzzOn: true },
  onLaunch: function () {
    // 静音键打开时也能听到朗读
    if (wx.setInnerAudioOption) {
      try { wx.setInnerAudioOption({ obeyMuteSwitch: false, mixWithOther: true }); } catch (e) {}
    }
  }
});
