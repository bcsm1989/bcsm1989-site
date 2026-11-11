(function(){
  var ENDPOINT='https://docs.google.com/forms/d/e/1FAIpQLSepgbnSNx0f_INX93hNy56eAZLVu_ThDKhLcwQfb3MtEpgb_w/formResponse';
  var form=document.getElementById('fleetForm'),panes=[].slice.call(form.querySelectorAll('.step-pane')),dots=[].slice.call(document.querySelectorAll('#steps li'));
  var back=document.getElementById('back'),next=document.getElementById('next'),send=document.getElementById('send'),formErr=document.getElementById('formErr'),cur=0;
  function setErr(f,msg){var e=f.querySelector('.err');f.classList.toggle('bad',!!msg);if(e){e.textContent=msg||'';e.hidden=!msg;}}
  function check(f){
    var radios=f.querySelectorAll('input[type=radio]'),boxes=f.querySelectorAll('input[type=checkbox]'),inp=f.querySelector('input:not([type=radio]):not([type=checkbox]),textarea'),msg='';
    if(radios.length){if(![].some.call(radios,function(r){return r.checked;}))msg='กรุณาเลือก 1 ข้อ';}
    else if(boxes.length){if(![].every.call(boxes,function(b){return b.checked;}))msg=boxes.length>1?'กรุณาติ๊กให้ครบทุกข้อ':'กรุณาติ๊กเพื่อยินยอม';}
    else if(inp){var v=inp.value.trim();
      if(inp.required&&!v)msg='กรุณากรอกข้อมูล';
      else if(v&&inp.type==='tel'&&!/^0[0-9]{8,9}$/.test(v))msg='เบอร์โทร 9–10 หลัก ขึ้นต้นด้วย 0 ไม่มีขีด';
      else if(v&&inp.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))msg='รูปแบบอีเมลไม่ถูกต้อง';
      else if(v&&inp.type==='number'&&!/^\d+$/.test(v))msg='กรอกเป็นจำนวนเต็ม';}
    setErr(f,msg);return !msg;
  }
  function validate(i){var bad=null;[].forEach.call(panes[i].querySelectorAll('.fld'),function(f){if(!check(f)&&!bad)bad=f;});
    if(bad){var t=bad.querySelector('input,textarea');if(t)t.focus();bad.scrollIntoView({block:'center',behavior:'smooth'});}return !bad;}
  function show(i){cur=i;panes.forEach(function(p,n){p.hidden=n!==i;});
    dots.forEach(function(d,n){d.classList.toggle('on',n===i);d.classList.toggle('past',n<i);if(n===i)d.setAttribute('aria-current','step');else d.removeAttribute('aria-current');});
    back.hidden=i===0;next.hidden=i===panes.length-1;send.hidden=i!==panes.length-1;formErr.hidden=true;
    var h=panes[i].querySelector('h2');h.focus({preventScroll:true});document.getElementById('steps').scrollIntoView({block:'start',behavior:'smooth'});}
  // ตรวจตอนกดถัดไปเท่านั้น และล้างข้อความผิดพลาดขณะพิมพ์หรือเลือก (ไม่ตรวจตอน blur เพราะหน้าจะขยับระหว่างคลิก)
  function recheck(e){var f=e.target.closest('.fld');if(f&&f.classList.contains('bad'))check(f);}
  form.addEventListener('input',recheck);form.addEventListener('change',recheck);
  next.addEventListener('click',function(){if(validate(cur))show(cur+1);});
  back.addEventListener('click',function(){show(cur-1);});
  form.addEventListener('keydown',function(e){if(e.key==='Enter'&&e.target.tagName==='INPUT'&&cur<panes.length-1){e.preventDefault();next.click();}});
  form.addEventListener('submit',function(e){e.preventDefault();
    for(var i=0;i<panes.length;i++){if(!validate(i)){if(i!==cur){show(i);validate(i);}return;}}
    var body=new URLSearchParams(new FormData(form));body.append('pageHistory','0,1,2,3');
    send.disabled=true;send.textContent='กำลังส่ง…';
    fetch(ENDPOINT,{method:'POST',mode:'no-cors',body:body}).then(function(){
      form.hidden=true;document.getElementById('steps').hidden=true;var d=document.getElementById('done');d.hidden=false;d.focus();d.scrollIntoView({block:'center'});
    }).catch(function(){send.disabled=false;send.textContent='ส่งแบบประเมิน';
      formErr.textContent='ส่งไม่สำเร็จ ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง หรือกรอกผ่าน Google Form ตามลิงก์ด้านล่าง';formErr.hidden=false;});
  });
})();
