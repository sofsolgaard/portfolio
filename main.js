// Sofie Hillmann – fælles script for alle sider
(function(){
  document.documentElement.classList.remove('no-js');
  var hasIO = 'IntersectionObserver' in window;

  // Scroll-driven effects, computed from element positions on each animation frame
  var top = document.querySelector('.top');
  var hero = document.querySelector('.hero');
  var reveals = [].slice.call(document.querySelectorAll('.reveal'));
  var splits = [].map.call(document.querySelectorAll('.split'), function(split){
    return {
      imgs: split.querySelectorAll('.split-media img'),
      count: split.querySelector('.split-media .count'),
      chapters: [].slice.call(split.querySelectorAll('.chapter[data-img]')),
      current: -1
    };
  });
  var wide = window.matchMedia('(min-width:900px)');

  function show(s, i){
    if (i === s.current) return;
    s.current = i;
    s.imgs.forEach(function(im, k){ im.classList.toggle('on', k === i); });
    if (s.count) s.count.textContent = String(i + 1).padStart(2, '0') + ' / ' + String(s.imgs.length).padStart(2, '0');
  }

  function update(){
    var vh = window.innerHeight;
    if (top && hero){
      top.classList.toggle('clear', hero.getBoundingClientRect().bottom > 60);
    }
    for (var i = reveals.length - 1; i >= 0; i--){
      if (reveals[i].getBoundingClientRect().top < vh * 0.9){
        reveals[i].classList.add('in'); reveals.splice(i, 1);
      }
    }
    // desktop: the chapter crossing the middle of the screen wins
    // mobile: the image covers the top half, so read the chapter in the lower part
    var line = wide.matches ? vh * 0.5 : vh * 0.72;
    splits.forEach(function(s){
      if (!s.chapters.length) return;
      var idx = parseInt(s.chapters[0].getAttribute('data-img'), 10);
      s.chapters.forEach(function(c){
        if (c.getBoundingClientRect().top < line) idx = parseInt(c.getAttribute('data-img'), 10);
      });
      show(s, idx);
    });
  }

  var ticking = false;
  function onScroll(){
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function(){ ticking = false; update(); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  window.addEventListener('load', update);
  update();

  // One-page menu: mark the section you are in
  var navLinks = [].slice.call(document.querySelectorAll('.top nav a[href^="#"]'));
  var targets = navLinks.map(function(a){ return document.querySelector(a.getAttribute('href')); });
  function markNav(){
    var line = window.innerHeight * 0.35, cur = -1;
    targets.forEach(function(t, i){ if (t && t.getBoundingClientRect().top < line) cur = i; });
    // at the very bottom of the page, the last section (contact) wins
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) cur = targets.length - 1;
    navLinks.forEach(function(a, i){ a.classList.toggle('active', i === cur); });
  }
  if (navLinks.length){
    window.addEventListener('scroll', function(){ requestAnimationFrame(markNav); }, { passive: true });
    window.addEventListener('resize', markNav);
    markNav();
  }

  // Gallery tabs
  var tabs = document.querySelectorAll('[role="tab"]');
  tabs.forEach(function(t){
    t.addEventListener('click', function(){
      tabs.forEach(function(o){
        var on = o === t;
        o.setAttribute('aria-selected', on);
        document.getElementById(o.getAttribute('aria-controls')).hidden = !on;
      });
    });
  });

  // Videos: play when visible, tap to pause. If the file is missing, the poster image stays.
  document.querySelectorAll('.clip').forEach(function(clip){
    var v = clip.querySelector('video');
    if (!v) return;
    var src = v.querySelector('source');
    var tag = clip.querySelector('.tag');
    var ok = true;
    src.addEventListener('error', function(){ ok = false; if (tag) tag.textContent = 'Video soon'; });
    clip.querySelector('.clip-frame').addEventListener('click', function(){
      if (!ok) return;
      if (v.paused) { v.play().catch(function(){}); } else { v.pause(); }
    });
    if (hasIO){
      new IntersectionObserver(function(e){
        if (!ok) return;
        if (e[0].isIntersecting) { v.play().catch(function(){}); } else { v.pause(); }
      }, { threshold: .6 }).observe(clip);
    }
  });
})();
