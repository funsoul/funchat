(function(doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = 'orientationchange' in window ? 'orientationchange' : 'resize', //获取屏幕横竖屏切换
    recalc = function() {
      var clientWidth = docEl.clientWidth; //获取屏幕宽度
      if (!clientWidth) return;
      docEl.style.fontSize = 100 / 1920 * clientWidth + 'px'; //设置跟节点文字大小  clientWidth如果等于1920 1920*100/1920=100px  所以你再1920设计图量得的实际尺寸除以100
    };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false); //监听手机横竖屏切换
  doc.addEventListener('DOMContentLoaded', recalc, false);
})(document, window);
