document.addEventListener('DOMContentLoaded', ()=> {
  if (navigator.userAgent.indexOf("Chrome") != -1 || navigator.userAgent.indexOf("Firefox") != -1 ) {
    var e = ["%c Created by SWIM team at SWIM.AI Inc. %c @SWIM.ai %c www.swim.ai", "display:block; padding:5px; background: #4171B8; color:#fff;", "display:block; padding:5px; background: #6ccbf4; color:#fff;", "display:block; padding:5px;"];
    console.info.apply(console, e);
  }

  const timerElement = document.querySelector('.main-header .timer');
  setInterval(function() {
      // your logic string for date
      timerElement.innerText = new Date().toLocaleString().replace(/\//g, '.').replace(/,/g, '');
  }, 1000);

  document.querySelector('.copyright').innerHTML = `&copy; ${new Date().getFullYear()} SWIM Inc.`;
}, false);
