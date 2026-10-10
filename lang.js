(function(){
  var root=document.documentElement, saved=null;
  try{ saved=localStorage.getItem('lang'); }catch(e){}
  if(!saved){ saved=(navigator.language||'th').toLowerCase().indexOf('th')===0?'th':'en'; }
  var q=new URLSearchParams(location.search).get('lang'); if(q==='th'||q==='en') saved=q;
  root.setAttribute('lang',saved);
  document.addEventListener('DOMContentLoaded',function(){
    var b=document.getElementById('langBtn'); if(!b) return;
    b.addEventListener('click',function(){
      var n=root.getAttribute('lang')==='th'?'en':'th';
      root.setAttribute('lang',n);
      try{ localStorage.setItem('lang',n); }catch(e){}
    });
  });
})();
