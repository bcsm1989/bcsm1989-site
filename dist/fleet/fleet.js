(function(){
  var ENDPOINT='https://docs.google.com/forms/d/e/1FAIpQLSepgbnSNx0f_INX93hNy56eAZLVu_ThDKhLcwQfb3MtEpgb_w/formResponse';
  // ช่องทางที่ลูกค้าเข้ามา: ลิงก์สั้น /fleet/line/ /fleet/fb/ /fleet/direct/ พามาที่ /fleet/?ch=...
  // ค่าต้องตรงกับตัวเลือกในคำถาม "ช่องทางที่พบแบบประเมินนี้" ของ Google Form (entry.1169509254)
  var CHANNELS={line:'LINE',fb:'Facebook',direct:'ติดต่อตรง (พนักงาน / ส่งลิงก์ให้)'};
  var ch=(new URLSearchParams(location.search).get('ch')||'').toLowerCase();
  var CHANNEL=CHANNELS[ch]||'เว็บไซต์ bcsm1989.com';
  [].forEach.call(document.querySelectorAll('a[href*="docs.google.com/forms"]'),function(a){
    a.href=a.href.replace(/entry\.1169509254=[^&]*/,'entry.1169509254='+encodeURIComponent(CHANNEL));});
  // ข้อความแจ้งเตือน 4 ภาษา — ใส่เป็น <span lang> ทุกภาษา เพื่อให้สลับภาษาแล้วเปลี่ยนตาม
  var MSG={
    pick1:['กรุณาเลือก 1 ข้อ','Please choose one option.','请选择一项。','1つ選択してください。'],
    tickAll:['กรุณาติ๊กให้ครบทุกข้อ','Please tick every box.','请勾选所有选项。','すべてにチェックを入れてください。'],
    tickOne:['กรุณาติ๊กเพื่อยินยอม','Please tick to give consent.','请勾选以表示同意。','同意する場合はチェックを入れてください。'],
    required:['กรุณากรอกข้อมูล','Please fill in this field.','请填写此项。','入力してください。'],
    tel:['เบอร์โทร 9–10 หลัก ขึ้นต้นด้วย 0 ไม่มีขีด','Phone number: 9–10 digits starting with 0, no dashes.','电话号码：以 0 开头的 9–10 位数字，不含横线。','電話番号：0から始まる9〜10桁、ハイフンなし'],
    email:['รูปแบบอีเมลไม่ถูกต้อง','Please enter a valid email address.','电子邮箱格式不正确。','メールアドレスの形式が正しくありません。'],
    int:['กรอกเป็นจำนวนเต็ม','Please enter a whole number.','请输入整数。','整数で入力してください。'],
    sending:['กำลังส่ง…','Sending…','正在提交…','送信中…'],
    submit:['ส่งแบบประเมิน','Submit assessment','提交评估','回答を送信'],
    failed:['ส่งไม่สำเร็จ ตรวจการเชื่อมต่ออินเทอร์เน็ตแล้วลองอีกครั้ง หรือกรอกผ่าน Google Form ตามลิงก์ด้านล่าง','Could not send. Check your internet connection and try again, or use the Google Form link below.','提交失败。请检查网络连接后重试，或通过下方的 Google Form 链接填写。','送信できませんでした。インターネット接続を確認して再度お試しいただくか、下のGoogle Formのリンクからご回答ください。']
  };
  var LANGS=['th','en','zh','ja'];
  function say(key){return MSG[key].map(function(t,i){return '<span lang="'+LANGS[i]+'">'+t+'</span>';}).join('');}
  var form=document.getElementById('fleetForm'),panes=[].slice.call(form.querySelectorAll('.step-pane')),dots=[].slice.call(document.querySelectorAll('#steps li'));
  var back=document.getElementById('back'),next=document.getElementById('next'),send=document.getElementById('send'),formErr=document.getElementById('formErr'),cur=0;
  function setErr(f,msg){var e=f.querySelector('.err');f.classList.toggle('bad',!!msg);if(e){e.innerHTML=msg?say(msg):'';e.hidden=!msg;}}
  function check(f){
    var radios=f.querySelectorAll('input[type=radio]'),boxes=f.querySelectorAll('input[type=checkbox]'),inp=f.querySelector('input:not([type=radio]):not([type=checkbox]),textarea'),msg='';
    if(radios.length){if(![].some.call(radios,function(r){return r.checked;}))msg='pick1';}
    else if(boxes.length){if(![].every.call(boxes,function(b){return b.checked;}))msg=boxes.length>1?'tickAll':'tickOne';}
    else if(inp){var v=inp.value.trim();
      if(inp.required&&!v)msg='required';
      else if(v&&inp.type==='tel'&&!/^0[0-9]{8,9}$/.test(v))msg='tel';
      else if(v&&inp.type==='email'&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v))msg='email';
      else if(v&&inp.type==='number'&&!/^\d+$/.test(v))msg='int';}
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
    body.append('entry.1169509254',CHANNEL);
    send.disabled=true;send.innerHTML=say('sending');
    fetch(ENDPOINT,{method:'POST',mode:'no-cors',body:body}).then(function(){
      form.hidden=true;document.getElementById('steps').hidden=true;var d=document.getElementById('done');d.hidden=false;d.focus();d.scrollIntoView({block:'center'});
    }).catch(function(){send.disabled=false;send.innerHTML=say('submit');
      formErr.innerHTML=say('failed');formErr.hidden=false;});
  });
})();
