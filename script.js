
console.log("script.js loaded");
// --- Mobile nav toggle ---
const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if (navToggle && navMenu) {
  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  // Close on link click (mobile)
  navMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("is-open");
      navToggle.setAttribute("aria-expanded", "false");
    });
  });
}

// --- Showroom carousel (auto-scroll + prev/next) ---
// This is a simple, clean carousel: it scrolls horizontally by slide width.
const track = document.getElementById("carouselTrack");
const prevBtn = document.getElementById("carouselPrev");
const nextBtn = document.getElementById("carouselNext");

let carouselTimer = null;
let isPaused = false;

function getSlideStep() {
  if (!track) return 0;
  const firstSlide = track.querySelector(".slide");
  if (!firstSlide) return 0;
  const slideWidth = firstSlide.getBoundingClientRect().width;
  const gap = 14; // must match CSS gap
  return slideWidth + gap;
}

function scrollNext() {
  if (!track) return;
  const step = getSlideStep();
  track.scrollBy({ left: step, behavior: "smooth" });

  // loop effect: if near the end, jump back
  const maxScroll = track.scrollWidth - track.clientWidth;
  if (track.scrollLeft >= maxScroll - step) {
    // After the smooth scroll, snap back
    setTimeout(() => track.scrollTo({ left: 0, behavior: "auto" }), 450);
  }
}

function scrollPrev() {
  if (!track) return;
  const step = getSlideStep();
  if (track.scrollLeft <= step) {
    // go to end
    track.scrollTo({ left: track.scrollWidth, behavior: "auto" });
  } else {
    track.scrollBy({ left: -step, behavior: "smooth" });
  }
}

function startCarousel() {
  if (!track) return;
  stopCarousel();
  carouselTimer = setInterval(() => {
    if (!isPaused) scrollNext();
  }, 3500); // speed
}

function stopCarousel() {
  if (carouselTimer) clearInterval(carouselTimer);
  carouselTimer = null;
}

if (track) {
  // Pause on hover (desktop)
  track.addEventListener("mouseenter", () => { isPaused = true; });
  track.addEventListener("mouseleave", () => { isPaused = false; });

  // Touch-friendly pause
  track.addEventListener("touchstart", () => { isPaused = true; }, { passive: true });
  track.addEventListener("touchend", () => { isPaused = false; }, { passive: true });

  if (nextBtn) nextBtn.addEventListener("click", () => { isPaused = true; scrollNext(); });
  if (prevBtn) prevBtn.addEventListener("click", () => { isPaused = true; scrollPrev(); });

  startCarousel();
}

// --- Quote form demo handling (front-end only) ---
// This shows a success message. To RECEIVE leads, you must connect to a form backend.
const form = document.getElementById("quoteForm");
const msg = document.getElementById("formMsg");

if (form && msg) {
  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Collect selected availability checkboxes:
    const availability = Array.from(form.querySelectorAll('input[name="availability"]:checked'))
      .map(el => el.value);

    if (availability.length === 0) {
      msg.textContent = "Please select at least one callback time.";
      return;
    }

    msg.textContent = "Mockup captured. In production, this will be sent to your email/CRM immediately.";
    form.reset();
  });
}
// ===== Hero slider (auto only) =====
const heroSlides = Array.from(document.querySelectorAll(".heroSlide"));
const heroDotsWrap = document.getElementById("heroDots");
const heroSlider = document.getElementById("heroSlider");

let heroIndex = 0;
let heroTimer = null;

function setHeroSlide(i){
  heroSlides.forEach((s, idx) => s.classList.toggle("is-active", idx === i));
  const dots = heroDotsWrap ? Array.from(heroDotsWrap.querySelectorAll(".heroDot")) : [];
  dots.forEach((d, idx) => d.classList.toggle("is-active", idx === i));
  heroIndex = i;
}

function nextHero(){
  setHeroSlide((heroIndex + 1) % heroSlides.length);
}

function startHero(){
  stopHero();
  heroTimer = setInterval(nextHero, 2000); // slide speed
}

function stopHero(){
  if (heroTimer) clearInterval(heroTimer);
  heroTimer = null;
}

if (heroSlides.length) {
  // Build dots (clickable)
  if (heroDotsWrap) {
    heroDotsWrap.innerHTML = "";
    heroSlides.forEach((_, i) => {
      const dot = document.createElement("button");
      dot.type = "button";
      dot.className = "heroDot" + (i === 0 ? " is-active" : "");
      dot.setAttribute("aria-label", `Go to slide ${i + 1}`);
      dot.addEventListener("click", () => {
        setHeroSlide(i);
        startHero();
      });
      heroDotsWrap.appendChild(dot);
    });
  }

  // Pause on hover/touch
  if (heroSlider) {
    heroSlider.addEventListener("mouseenter", stopHero);
    heroSlider.addEventListener("mouseleave", startHero);
    heroSlider.addEventListener("touchstart", stopHero, { passive:true });
    heroSlider.addEventListener("touchend", startHero, { passive:true });
  }

  setHeroSlide(0);
  startHero();
}
// ===============================
// Showroom autoplay slider
// ===============================
(function showroomAutoplay() {
  const track = document.getElementById("showroomTrack");
  if (!track) return;

  const slides = Array.from(track.querySelectorAll(".showroomSlider__img"));
  if (slides.length <= 1) return;

  let index = 0;
  const intervalMs = 2500; // speed (lower = faster)

  // Make sure track starts at 0
  track.style.transform = "translateX(0)";

  setInterval(() => {
    index = (index + 1) % slides.length;
    track.style.transform = `translateX(-${index * 100}%)`;
  }, intervalMs);
})();
const quoteForm = document.getElementById("quoteForm");
const quoteStatus = document.getElementById("quoteStatus");

if (quoteForm) {
  quoteForm.addEventListener("submit", async function (e) {
    e.preventDefault(); // STOP page redirect

    const formData = new FormData(quoteForm);

    try {
      const response = await fetch(quoteForm.action, {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      if (response.ok) {
        quoteStatus.textContent = "✓ Request sent successfully. We will contact you shortly.";
        quoteStatus.style.color = "green";
        quoteForm.reset();
      } else {
        quoteStatus.textContent = "Something went wrong. Please try again.";
        quoteStatus.style.color = "red";
      }
    } catch (error) {
      quoteStatus.textContent = "Network error. Please try again later.";
      quoteStatus.style.color = "red";
    }
  });
}