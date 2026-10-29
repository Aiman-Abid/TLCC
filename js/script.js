/* =====================================================
   HELPERS
===================================================== */

const isMobile = () => window.innerWidth <= 768;

/*
   Agar href same page ka hash link hai ("#about" ya "index.html#about")
   to hash wapas karta hai, warna null.
*/
function getSamePageHash(href) {

    if (!href) return null;

    if (href.startsWith("#")) {
        return href.length > 1 ? href : null;
    }

    try {
        const url = new URL(href, window.location.href);

        if (
            url.origin === window.location.origin &&
            url.pathname === window.location.pathname &&
            url.hash
        ) {
            return url.hash;
        }
    } catch (err) {
        /* ignore */
    }

    return null;

}


/* =====================================================
   MOBILE MENU
===================================================== */

const menuToggle = document.querySelector(".menu-toggle");
const navMenu = document.querySelector(".nav-links");

function closeMobileMenu() {

    if (navMenu) {
        navMenu.classList.remove("show");

        /* Open dropdowns bhi band karo */
        navMenu
            .querySelectorAll("li.open")
            .forEach(li => li.classList.remove("open"));
    }

    if (menuToggle) {
        menuToggle.classList.remove("active");
        menuToggle.setAttribute("aria-expanded", "false");
    }

}

if (menuToggle && navMenu) {

    menuToggle.addEventListener("click", () => {

        const isOpen = navMenu.classList.toggle("show");

        menuToggle.classList.toggle("active", isOpen);
        menuToggle.setAttribute("aria-expanded", String(isOpen));

    });

}


/* =====================================================
   NAVIGATION LINKS
   (mobile dropdown + BS submenu + smooth scroll)
===================================================== */

const navLinks = document.querySelectorAll(".nav-links a");

navLinks.forEach(link => {

    link.addEventListener("click", function (e) {

        const li = this.parentElement;
        const next = this.nextElementSibling;

        const hasSubMenu =
            next &&
            next.tagName === "UL" &&
            (
                li.classList.contains("dropdown") ||
                li.classList.contains("has-submenu")
            );


        /* ---------- Mobile: tap se dropdown / submenu kholo ---------- */

        if (isMobile() && hasSubMenu) {

            e.preventDefault();

            const wasOpen = li.classList.contains("open");

            /* Sirf same level ke dusre open items band karo */
            li.parentElement
                .querySelectorAll(":scope > li.open")
                .forEach(item => item.classList.remove("open"));

            if (!wasOpen) {
                li.classList.add("open");
            }

            return;

        }


        /* ---------- News & Events menu: us category ko kholo ---------- */

        const categoryName = this.dataset.category;

        if (categoryName && newsData[categoryName]) {

            e.preventDefault();
            closeMobileMenu();
            openCategory(categoryName);

            return;

        }


        /* ---------- Same page ka hash link: smooth scroll ---------- */

        const hash = getSamePageHash(this.getAttribute("href"));

        if (hash) {

            /* Agar News category page khula hai to pehle wapas aao */
            if (
                hash === "#news-events" &&
                typeof categoryPage !== "undefined" &&
                categoryPage &&
                categoryPage.classList.contains("active")
            ) {
                e.preventDefault();
                closeMobileMenu();
                backToNews();
                return;
            }

            const target = document.querySelector(hash);

            if (target) {
                e.preventDefault();

                target.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });
            }

        }

        closeMobileMenu();

    });

});


/* =====================================================
   CLOSE MOBILE MENU WHEN CLICKING OUTSIDE
===================================================== */

document.addEventListener("click", function (e) {

    if (!menuToggle || !navMenu) return;

    if (
        !navMenu.contains(e.target) &&
        !menuToggle.contains(e.target)
    ) {
        closeMobileMenu();
    }

});


/* =====================================================
   ACTIVE NAVIGATION
===================================================== */

/* Jin sections ka apna menu link nahi, unhe kisi link se jodo */
const sectionToNav = {
    "welcome-slide": "about",
    "categoryPage": "news-events"
};

const topLevelNavLinks =
    document.querySelectorAll(".nav-links > li > a");

function updateActiveNavigation() {

    const sections = document.querySelectorAll("section[id]");

    /* Detail pages (ics-details.html waghera) par sections nahi hote */
    if (!sections.length) return;

    const scrollPosition = window.scrollY + 180;

    let currentSection = "";

    sections.forEach(section => {

        const top = section.offsetTop;
        const height = section.offsetHeight;

        if (
            height > 0 &&
            scrollPosition >= top &&
            scrollPosition < top + height
        ) {
            currentSection = section.getAttribute("id");
        }

    });

    if (sectionToNav[currentSection]) {
        currentSection = sectionToNav[currentSection];
    }

    topLevelNavLinks.forEach(link => {

        link.classList.remove("active");

        const hash = getSamePageHash(link.getAttribute("href"));

        if (currentSection && hash === "#" + currentSection) {
            link.classList.add("active");
        }

    });

}

window.addEventListener("scroll", updateActiveNavigation);
window.addEventListener("load", updateActiveNavigation);


/* =====================================================
   BACK TO TOP
===================================================== */

const backToTop = document.querySelector(".back-to-top");

if (backToTop) {

    window.addEventListener("scroll", () => {
        backToTop.classList.toggle("show", window.scrollY > 400);
    });

    backToTop.addEventListener("click", () => {
        window.scrollTo({ top: 0, behavior: "smooth" });
    });

}


/* =====================================================
   CONTACT FORM
===================================================== */

const contactForm = document.querySelector("#contactForm");

if (contactForm) {
    contactForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thank you! Your message has been submitted successfully.");
        contactForm.reset();
    });
}


/* =====================================================
   NEWSLETTER
===================================================== */

const newsletterForm = document.querySelector("#newsletterForm");

if (newsletterForm) {
    newsletterForm.addEventListener("submit", function (e) {
        e.preventDefault();
        alert("Thank you for subscribing to our newsletter!");
        newsletterForm.reset();
    });
}


/* =====================================================
   CURRENT YEAR
===================================================== */

const yearElement = document.querySelector("#year");

if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}


/* =====================================================
   HOME HERO SLIDER
===================================================== */

const heroSlides = document.querySelectorAll(".hero-slide");
const slideInfos = document.querySelectorAll(".slide-info");
const sideCards = document.querySelectorAll(".side-card");
const heroDots = document.querySelectorAll(".hero-dots .dot");

const HERO_INTERVAL = 5000; /* 5 second */

let currentSlide = 0;
let heroTimer = null;


function showHeroSlide(index) {

    if (!heroSlides.length) return;

    if (index >= heroSlides.length) index = 0;
    if (index < 0) index = heroSlides.length - 1;

    currentSlide = index;

    [heroSlides, slideInfos, sideCards, heroDots].forEach(list => {
        list.forEach((item, i) => {
            item.classList.toggle("active", i === index);
        });
    });

}


function nextHeroSlide() {
    showHeroSlide(currentSlide + 1);
}


function stopHeroSlider() {
    if (heroTimer) {
        clearInterval(heroTimer);
        heroTimer = null;
    }
}


function startHeroSlider() {
    stopHeroSlider();
    heroTimer = setInterval(nextHeroSlide, HERO_INTERVAL);
}


sideCards.forEach((card, index) => {
    card.addEventListener("click", () => {
        showHeroSlide(index);
        startHeroSlider();
    });
});


heroDots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
        showHeroSlide(index);
        startHeroSlider();
    });
});


if (heroSlides.length) {
    showHeroSlide(0);
    startHeroSlider();
}


/* =====================================================
   IMAGE PATH FIX
===================================================== */
function fixImagePath(path) {
    if (!path) return path;
    return path.startsWith("res/") ? path : "res/img/" + path;
}

if (typeof newsData !== "undefined") {
    Object.values(newsData).forEach(category => {
        category.images.forEach(item => {
            item.image = fixImagePath(item.image);
            if (item.detailImage) {
                item.detailImage = fixImagePath(item.detailImage);
            }
        });
    });
}


/* =====================================================
   ELEMENTS & STATE
===================================================== */
const categoryPage = document.getElementById("categoryPage");
const imageDetail = document.getElementById("imageDetail");
const categoryGrid = document.getElementById("categoryGrid");
const newsEvents = document.querySelector(".news-events");

let lastOpenedImageIndex = 0;
let lastOpenedCategory = "";


/* =====================================================
   OPEN CATEGORY
===================================================== */
function openCategory(categoryName) {
    const data = newsData[categoryName];

    if (!data) {
        console.error("Category not found:", categoryName);
        return;
    }

    lastOpenedCategory = categoryName;
    lastOpenedImageIndex = 0;

    if (newsEvents) newsEvents.style.display = "none";
    if (categoryPage) categoryPage.classList.add("active");

    document.getElementById("categoryTag").textContent = data.tag;
    document.getElementById("categoryTitle").textContent = data.title;
    document.getElementById("categoryDescription").textContent = data.description;

    if (imageDetail) imageDetail.classList.remove("active");

    if (categoryGrid) {
        categoryGrid.innerHTML = "";
        categoryGrid.style.display = "flex";

        data.images.forEach((item, index) => {
            const card = document.createElement("div");
            card.className = "category-card";
            card.id = "category-card-" + index;

            const imageWrap = document.createElement("div");
            imageWrap.className = "category-image";

            const img = document.createElement("img");
            img.src = item.image;
            img.alt = item.title;
            img.loading = "lazy";

            imageWrap.appendChild(img);

            const content = document.createElement("div");
            content.className = "category-card-content";

            const title = document.createElement("h3");
            title.textContent = item.title;

            const desc = document.createElement("p");
            desc.textContent = item.description;

            const button = document.createElement("button");
            button.type = "button";
            button.className = "view-more-btn";
            button.textContent = "View Details →";

            button.addEventListener("click", e => {
                e.stopPropagation();
                openImageDetail(categoryName, index);
            });

            content.appendChild(title);
            content.appendChild(desc);
            content.appendChild(button);

            card.appendChild(imageWrap);
            card.appendChild(content);

            categoryGrid.appendChild(card);
        });
    }

    if (categoryPage) {
        categoryPage.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}


/* =====================================================
   OPEN IMAGE DETAIL
===================================================== */
function openImageDetail(categoryName, imageIndex) {
    const data = newsData[categoryName];
    if (!data) return;

    const item = data.images[imageIndex];
    if (!item) return;

    lastOpenedImageIndex = imageIndex;
    lastOpenedCategory = categoryName;

    if (categoryGrid) categoryGrid.style.display = "none";
    if (imageDetail) imageDetail.classList.add("active");

    const detailImage = document.getElementById("detailImage");

    if (detailImage) {
        detailImage.onerror = function () {
            this.onerror = null;
            this.src = item.image;
        };

        detailImage.src = item.detailImage || item.image;
        detailImage.alt = item.title;
    }

    document.getElementById("detailTag").textContent = data.tag;
    document.getElementById("detailTitle").textContent = item.title;
    document.getElementById("detailDescription").textContent = item.description;
    document.getElementById("detailInfo").textContent = item.info;

    if (imageDetail) {
        imageDetail.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}


/* =====================================================
   BACK FUNCTIONS
===================================================== */
function backToImages() {
    if (imageDetail) imageDetail.classList.remove("active");
    if (categoryGrid) categoryGrid.style.display = "flex";

    const targetCard = document.getElementById("category-card-" + lastOpenedImageIndex);

    if (targetCard) {
        requestAnimationFrame(() => {
            targetCard.scrollIntoView({ behavior: "smooth", block: "center" });
        });
    }
}

function backToNews() {
    if (categoryPage) categoryPage.classList.remove("active");
    if (imageDetail) imageDetail.classList.remove("active");

    if (newsEvents) newsEvents.style.display = "";

    lastOpenedImageIndex = 0;
    lastOpenedCategory = "";

    if (newsEvents) {
        newsEvents.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}
/* =====================================================
    LEADERSHIP CONTINUOUS SLIDER (FIXED & OPTIMIZED)
===================================================== */

const leadershipTrack = document.querySelector(".leadership-track");

if (leadershipTrack) {

    const originalCards = Array.from(leadershipTrack.querySelectorAll(".faculty-card"));

    // Clone cards for infinite loop effect
    originalCards.forEach(card => {
        const clone = card.cloneNode(true);
        clone.setAttribute("aria-hidden", "true");
        leadershipTrack.appendChild(clone);
    });

    let leadershipIndex = 0;
    let leadershipTimer = null;
    let lastWidth = window.innerWidth;

    function getLeadershipCardWidth() {
        const card = leadershipTrack.querySelector(".faculty-card");
        if (!card) return 0;

        const cardWidth = card.getBoundingClientRect().width;
        const gap = parseFloat(window.getComputedStyle(leadershipTrack).gap) || 0;

        return cardWidth + gap;
    }

    function moveLeadership() {
        leadershipIndex++;

        const cardWidth = getLeadershipCardWidth();
        leadershipTrack.style.transition = "transform 0.8s ease-in-out";
        
        // FIXED: Added multiplication (*) operator here
        leadershipTrack.style.transform = `translateX(-${leadershipIndex * cardWidth}px)`;

        // Reset loop smoothly when it reaches the end of original cards
        if (leadershipIndex >= originalCards.length) {
            setTimeout(() => {
                leadershipTrack.style.transition = "none";
                leadershipIndex = 0;
                leadershipTrack.style.transform = "translateX(0)";
            }, 800); // Matches the CSS transition duration
        }
    }

    function startLeadershipSlider() {
        if (leadershipTimer) clearInterval(leadershipTimer);
        leadershipTimer = setInterval(moveLeadership, 3000);
    }

    // Window resize handler to prevent layout breaking
    window.addEventListener("resize", () => {
        if (window.innerWidth === lastWidth) return;
        lastWidth = window.innerWidth;

        leadershipIndex = 0;
        leadershipTrack.style.transition = "none";
        leadershipTrack.style.transform = "translateX(0)";
    });

    // CRITICAL FIX: Wait for all images to fully load before calculating dimensions & starting slider
    window.addEventListener("load", () => {
        startLeadershipSlider();
    });

}


/* =====================================================
   EVENT LISTENERS (GALLERY CLICKS, ESC & DRAG)
===================================================== */
document.addEventListener("DOMContentLoaded", function () {

    document.querySelectorAll(".gallery-item").forEach(item => {
        item.addEventListener("click", function () {
            const categoryName = this.getAttribute("data-category");
            if (categoryName) {
                openCategory(categoryName);
            }
        });

        item.addEventListener("keydown", function (e) {
            if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                const categoryName = this.getAttribute("data-category");
                if (categoryName) {
                    openCategory(categoryName);
                }
            }
        });
    });

    const backToNewsBtn = document.getElementById("backToNewsBtn");
    if (backToNewsBtn) {
        backToNewsBtn.addEventListener("click", backToNews);
    }

    const backToImagesBtn = document.getElementById("backToImagesBtn");
    if (backToImagesBtn) {
        backToImagesBtn.addEventListener("click", backToImages);
    }

});

document.addEventListener("keydown", function (e) {
    if (e.key !== "Escape") return;

    if (imageDetail && imageDetail.classList.contains("active")) {
        backToImages();
        return;
    }

    if (categoryPage && categoryPage.classList.contains("active")) {
        backToNews();
    }
});

document.addEventListener("dragstart", function (e) {
    if (e.target && e.target.tagName === "IMG") {
        e.preventDefault();
    }
});


/* =====================================================
   WEBSITE LOADED
===================================================== */

console.log("The Lahore City College Zafarwal website loaded successfully.");
