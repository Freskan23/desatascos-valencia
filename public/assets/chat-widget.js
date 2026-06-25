/* chat-widget.js — Asistente virtual de Lajenuco (self-contained).
   Inyecta su propio CSS + HTML y habla con /api/chat.
   Incluye adjuntar foto (con reducción de tamaño en el navegador). */
(function () {
  if (window.__lajenucoChat) return; window.__lajenucoChat = true;

  var CSS = `
  .lj-launch{position:fixed;right:24px;bottom:24px;z-index:1000;width:60px;height:60px;border-radius:50%;
    background:var(--brand,#1e6fc8);color:#fff;display:flex;align-items:center;justify-content:center;font-size:24px;
    box-shadow:0 8px 28px rgba(30,111,200,.45);cursor:pointer;transition:transform .2s;border:none;}
  .lj-launch:hover{transform:scale(1.07);}
  .lj-launch .lj-badge{position:absolute;top:-3px;right:-3px;width:18px;height:18px;border-radius:50%;background:#dc2626;
    color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;}
  .lj-panel{position:fixed;right:24px;bottom:96px;z-index:1000;width:370px;max-width:calc(100vw - 32px);height:560px;
    max-height:calc(100vh - 140px);background:#fff;border-radius:18px;box-shadow:0 24px 60px rgba(0,0,0,.28);
    display:none;flex-direction:column;overflow:hidden;font-family:var(--font,'Montserrat',sans-serif);}
  .lj-panel.open{display:flex;animation:lj-in .22s ease;}
  @keyframes lj-in{from{opacity:0;transform:translateY(14px);}to{opacity:1;transform:translateY(0);}}
  .lj-head{background:#0f172a;color:#fff;padding:16px 18px;display:flex;align-items:center;gap:12px;}
  .lj-head .lj-av{width:38px;height:38px;border-radius:50%;background:var(--brand,#1e6fc8);display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0;}
  .lj-head h4{font-size:15px;font-weight:700;margin:0;line-height:1.2;}
  .lj-head p{font-size:12px;margin:2px 0 0;color:rgba(255,255,255,.6);display:flex;align-items:center;gap:6px;}
  .lj-head .lj-on{width:7px;height:7px;border-radius:50%;background:#22b14c;display:inline-block;}
  .lj-head .lj-x{margin-left:auto;background:none;border:none;color:rgba(255,255,255,.6);font-size:20px;cursor:pointer;line-height:1;}
  .lj-head .lj-x:hover{color:#fff;}
  .lj-msgs{flex:1;overflow-y:auto;padding:18px;display:flex;flex-direction:column;gap:12px;background:#f8fafc;}
  .lj-msg{max-width:80%;padding:11px 14px;border-radius:14px;font-size:14px;line-height:1.5;white-space:pre-wrap;word-wrap:break-word;}
  .lj-bot{align-self:flex-start;background:#fff;color:#334155;border:1px solid #e8edf3;border-bottom-left-radius:4px;}
  .lj-user{align-self:flex-end;background:var(--brand,#1e6fc8);color:#fff;border-bottom-right-radius:4px;}
  .lj-user img{max-width:100%;border-radius:8px;margin-top:6px;display:block;}
  .lj-typing{align-self:flex-start;display:flex;gap:4px;padding:12px 14px;background:#fff;border:1px solid #e8edf3;border-radius:14px;}
  .lj-typing span{width:7px;height:7px;border-radius:50%;background:#cbd5e1;animation:lj-bounce 1.2s infinite;}
  .lj-typing span:nth-child(2){animation-delay:.2s;}.lj-typing span:nth-child(3){animation-delay:.4s;}
  @keyframes lj-bounce{0%,60%,100%{transform:translateY(0);opacity:.5;}30%{transform:translateY(-5px);opacity:1;}}
  .lj-foot{border-top:1px solid #e8edf3;padding:10px;background:#fff;}
  .lj-chip{display:none;align-items:center;gap:8px;background:#eef4fb;border:1px solid #d4e3f5;border-radius:8px;padding:6px 10px;margin-bottom:8px;font-size:12px;color:#1554a0;}
  .lj-chip.show{display:flex;}.lj-chip button{margin-left:auto;background:none;border:none;color:#64748b;cursor:pointer;font-size:14px;}
  .lj-inrow{display:flex;align-items:flex-end;gap:8px;}
  .lj-attach{flex-shrink:0;width:40px;height:40px;border-radius:10px;border:1px solid #e2e8f0;background:#fff;color:#64748b;font-size:16px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .lj-attach:hover{border-color:var(--brand,#1e6fc8);color:var(--brand,#1e6fc8);}
  .lj-input{flex:1;resize:none;border:1px solid #e2e8f0;border-radius:10px;padding:10px 12px;font-size:14px;font-family:inherit;max-height:90px;outline:none;}
  .lj-input:focus{border-color:var(--brand,#1e6fc8);}
  .lj-send{flex-shrink:0;width:40px;height:40px;border-radius:10px;border:none;background:var(--brand,#1e6fc8);color:#fff;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;}
  .lj-send:disabled{opacity:.5;cursor:not-allowed;}
  .lj-done{text-align:center;font-size:12px;color:#16a34a;padding:6px;}
  @media(max-width:560px){.lj-panel{right:8px;left:8px;width:auto;bottom:84px;height:calc(100vh - 150px);}.lj-launch{right:16px;bottom:16px;}}
  `;

  var st = document.createElement('style'); st.textContent = CSS; document.head.appendChild(st);

  var wrap = document.createElement('div');
  wrap.innerHTML =
    '<button class="lj-launch" id="ljLaunch" aria-label="Abrir chat"><i class="fas fa-comment-dots"></i><span class="lj-badge">1</span></button>' +
    '<div class="lj-panel" id="ljPanel" role="dialog" aria-label="Asistente Lajenuco">' +
      '<div class="lj-head"><div class="lj-av"><i class="fas fa-headset"></i></div>' +
        '<div><h4>Asistente Lajenuco</h4><p><span class="lj-on"></span> Normalmente responde al instante</p></div>' +
        '<button class="lj-x" id="ljClose" aria-label="Cerrar">&times;</button></div>' +
      '<div class="lj-msgs" id="ljMsgs"></div>' +
      '<div class="lj-foot">' +
        '<div class="lj-chip" id="ljChip"><i class="fas fa-image"></i> <span id="ljChipName">foto</span><button id="ljChipX" aria-label="Quitar">&times;</button></div>' +
        '<div class="lj-inrow">' +
          '<button class="lj-attach" id="ljAttach" aria-label="Adjuntar foto"><i class="fas fa-paperclip"></i></button>' +
          '<input type="file" id="ljFile" accept="image/*" style="display:none">' +
          '<textarea class="lj-input" id="ljInput" rows="1" placeholder="Escribe tu mensaje..."></textarea>' +
          '<button class="lj-send" id="ljSend" aria-label="Enviar"><i class="fas fa-paper-plane"></i></button>' +
        '</div>' +
      '</div>' +
    '</div>';
  document.body.appendChild(wrap);

  var $ = function (id) { return document.getElementById(id); };
  var panel = $('ljPanel'), msgs = $('ljMsgs'), input = $('ljInput'), sendBtn = $('ljSend');
  var fileInput = $('ljFile'), chip = $('ljChip'), chipName = $('ljChipName');
  var convo = [], photo = null, busy = false, started = false, finished = false;

  function addMsg(role, text, imgData) {
    var d = document.createElement('div');
    d.className = 'lj-msg ' + (role === 'user' ? 'lj-user' : 'lj-bot');
    d.textContent = text || '';
    if (imgData) { var im = document.createElement('img'); im.src = imgData; d.appendChild(im); }
    msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
  }
  function typing(on) {
    var t = $('ljTyping');
    if (on && !t) { var d = document.createElement('div'); d.className = 'lj-typing'; d.id = 'ljTyping'; d.innerHTML = '<span></span><span></span><span></span>'; msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight; }
    else if (!on && t) t.remove();
  }

  function open() {
    panel.classList.add('open');
    var b = $('ljLaunch').querySelector('.lj-badge'); if (b) b.style.display = 'none';
    if (!started) {
      started = true;
      var hi = '¡Hola! 👋 Soy el asistente de Lajenuco. ¿Qué problema de desatasco tienes? Te ayudo y aviso a un técnico para que te llame.';
      addMsg('assistant', hi); convo.push({ role: 'assistant', content: hi });
    }
    setTimeout(function () { input.focus(); }, 100);
  }
  function close() { panel.classList.remove('open'); }

  $('ljLaunch').onclick = function () { panel.classList.contains('open') ? close() : open(); };
  $('ljClose').onclick = close;

  input.addEventListener('input', function () { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 90) + 'px'; });
  input.addEventListener('keydown', function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
  sendBtn.onclick = send;

  $('ljAttach').onclick = function () { fileInput.click(); };
  $('ljChipX').onclick = function () { photo = null; chip.classList.remove('show'); fileInput.value = ''; };
  fileInput.onchange = function () {
    var f = fileInput.files[0]; if (!f) return;
    downscale(f, function (b64, dataUrl) {
      photo = { name: f.name, b64: b64, dataUrl: dataUrl };
      chipName.textContent = f.name.length > 22 ? f.name.slice(0, 20) + '…' : f.name;
      chip.classList.add('show');
    });
  };

  // Reduce la imagen a max 1024px y JPEG 0.7 antes de enviarla
  function downscale(file, cb) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var max = 1024, w = img.width, h = img.height;
        if (w > max || h > max) { if (w > h) { h = Math.round(h * max / w); w = max; } else { w = Math.round(w * max / h); h = max; } }
        var c = document.createElement('canvas'); c.width = w; c.height = h;
        c.getContext('2d').drawImage(img, 0, 0, w, h);
        var dataUrl = c.toDataURL('image/jpeg', 0.7);
        cb(dataUrl.split(',')[1], dataUrl);
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  function send() {
    if (busy || finished) return;
    var text = input.value.trim();
    if (!text && !photo) return;

    addMsg('user', text, photo ? photo.dataUrl : null);
    convo.push({ role: 'user', content: text || '(foto adjunta)' });
    input.value = ''; input.style.height = 'auto';

    busy = true; sendBtn.disabled = true; typing(true);
    var payload = { messages: convo, photo: photo ? { name: photo.name, b64: photo.b64 } : null };

    fetch('/api/chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        typing(false);
        var reply = j.reply || 'Disculpa, ha habido un problema. Llámanos al +34 677 123 123.';
        addMsg('assistant', reply); convo.push({ role: 'assistant', content: reply });
        if (j.done) {
          finished = true;
          var d = document.createElement('div'); d.className = 'lj-done'; d.innerHTML = '<i class="fas fa-check-circle"></i> Aviso enviado. Un técnico te llamará en breve.';
          msgs.appendChild(d); msgs.scrollTop = msgs.scrollHeight;
          input.placeholder = 'Conversación finalizada';
          input.disabled = true; sendBtn.disabled = true; $('ljAttach').disabled = true;
          photo = null; chip.classList.remove('show');
        }
      })
      .catch(function () {
        typing(false);
        addMsg('assistant', 'Ups, no he podido conectar. Llámanos directamente al +34 677 123 123.');
      })
      .finally(function () { busy = false; if (!finished) sendBtn.disabled = false; });
  }
})();
