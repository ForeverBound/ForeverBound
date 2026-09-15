'use strict';
(() => {
 const sections = ['home','episodes','characters','behind-the-scenes','soundtrack','previews'];
 const names = ['Home','Episodes','Characters','Behind the Scenes','Soundtrack','Previews'];
 const content = document.getElementById('card-content');
 const cache = new Map();
 let current = 0, request = 0;
 document.getElementById('year').textContent = new Date().getFullYear();
 function sync() {
  document.getElementById('section-label').textContent = names[current];
  document.getElementById('position-label').textContent = `${String(current + 1).padStart(2,'0')} / 06`;
  content.setAttribute('aria-label',`${names[current]} content`);
  document.title = `${names[current]} — Forever Bound`;
  document.querySelectorAll('.topbar nav a,.dots a').forEach(a => {
   if (a.hash === `#${sections[current]}`) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
  });
 }
 async function load() {
  const key = location.hash.slice(1).toLowerCase();
  current = Math.max(0, sections.indexOf(key));
  const section = sections[current], ticket = ++request;
  content.querySelectorAll('video,audio').forEach(m => m.pause());
  content.replaceChildren();
  content.setAttribute('aria-busy','true');
  const message = document.createElement('p'); message.className='loading'; message.textContent='Loading…'; content.append(message);
  sync();
  try {
   if (!cache.has(section)) {
    const response = await fetch(`pages/${section}.html`);
    if (!response.ok) throw new Error(`Page returned ${response.status}`);
    cache.set(section, await response.text());
   }
   if (ticket !== request) return;
   content.innerHTML = cache.get(section);
   content.scrollTop=0;
   content.classList.remove('arrive'); void content.offsetWidth; content.classList.add('arrive');
   wireMedia();
  } catch(error) {
   if (ticket !== request) return;
   content.innerHTML='<div class="error-state"><h1>This page could not be opened</h1><p>Please try again. If you are viewing downloaded files, upload them to your website first.</p><button class="button" id="retry" type="button">Try again</button></div>';
   content.querySelector('#retry').addEventListener('click',load);
  } finally { if(ticket===request) {content.removeAttribute('aria-busy'); if (location.hash) content.focus({preventScroll:true});} }
 }
 function move(delta) {location.hash=sections[(current+delta+sections.length)%sections.length];}
 document.querySelector('.previous').addEventListener('click',()=>move(-1));
 document.querySelector('.next').addEventListener('click',()=>move(1));
 function wireMedia() {
  const video=content.querySelector('#preview-video');
  if(!video) return;
  content.querySelectorAll('[data-video]').forEach(button => button.addEventListener('click',()=>{
   const wasPlaying=!video.paused;
   video.pause();video.src=button.dataset.video;video.load();
   content.querySelectorAll('[data-video]').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   content.querySelector('#video-label').textContent=button.textContent;
   if(wasPlaying) video.play().catch(()=>{});
  }));
 }
 window.addEventListener('hashchange',load);
 load();
})();
