/* =====================================================
    DETAIL PAGE - 3 IMAGE CARDS ROTATING ANIMATION
===================================================== */

(function () {

    /* ---------- CSS (khud inject hota hai) ---------- */
    const css = `
.detail-slider {
    width: 100%;
    max-width: 1100px;
    margin: 45px auto 0;
    box-sizing: border-box;
}
.detail-slider h3 {
    font-size: 26px;
    color: #252b48;
    margin: 0 0 22px;
    text-align: center;
}
.ds-stage {
    --gap: 22px;
    position: relative;
    width: 100%;
    height: 300px;
    padding: 14px 0;
    box-sizing: border-box;
}
.ds-card {
    --slot: 0;
    --s: 1;
    position: absolute;
    top: 14px;
    left: 0;
    width: calc((100% - (var(--n) - 1) * var(--gap)) / var(--n));
    height: calc(100% - 28px);
    border-radius: 14px;
    overflow: hidden;
    background: #eeeeee;
    box-shadow: 0 8px 25px rgba(0,0,0,0.12);
    transform: translateX(calc(var(--slot) * (100% + var(--gap)))) scale(var(--s));
    transition: transform 0.9s cubic-bezier(.65,.05,.36,1),
                opacity 0.6s ease,
                box-shadow 0.6s ease;
}
.ds-card.is-mid {
    box-shadow: 0 16px 38px rgba(0,0,0,0.22);
}
.ds-card.is-leaving { opacity: 0; transition: opacity 0.45s ease; }
.ds-card.is-jump    { transition: none !important; }
.ds-card img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
}
@media (max-width: 900px) {
    .ds-stage { height: 240px; --gap: 16px; }
}
@media (max-width: 650px) {
    .detail-slider { margin-top: 30px; }
    .detail-slider h3 { font-size: 21px; margin-bottom: 14px; }
    .ds-stage { height: 170px; --gap: 10px; }
    .ds-card { border-radius: 10px; }
}
`;
    const styleTag = document.createElement("style");
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    /* ---------- Helpers ---------- */
    let timer = null;
    let busy = false;
    const DELAY = 3000;

    function stop() {
        if (timer) { clearInterval(timer); timer = null; }
    }

    function findItem(title) {
        if (typeof newsData === "undefined") return null;
        for (const key in newsData) {
            const cat = newsData[key];
            const item = (cat.images || []).find(function (i) {
                return i.title.trim() === title;
            });
            if (item) return { cat: cat, item: item };
        }
        return null;
    }

    function build(detail) {
        const h2 = detail.querySelector(".detail-text h2");
        const content = detail.querySelector(".detail-content");
        if (!h2 || !content) return;

        const title = h2.textContent.trim();
        const old = detail.querySelector(".detail-slider");
        if (old && old.dataset.key === title) return;   
        if (old) old.remove();
        stop();

        const found = findItem(title);
        if (!found) return;

        // YAHAN FIX KIYA GAYA HAI:
        const list = found.item.images;
        if (!list || !list.length) return;
        const n = list.length;

        const mainImg = detail.querySelector(".detail-image img");
        const mainSrc = mainImg ? (mainImg.getAttribute("src") || "") : "";
        const base = mainSrc.indexOf("/") !== -1
            ? mainSrc.slice(0, mainSrc.lastIndexOf("/") + 1)
            : "";

        const box = document.createElement("div");
        box.className = "detail-slider";
        box.dataset.key = title;
        box.innerHTML =
            "<h3>More Photos</h3>" +
            '<div class="ds-stage">' +
                list.map(function (name) {
                    const src = (name.indexOf("/") !== -1) ? name : base + name;
                    return '<div class="ds-card"><img src="' + src + '" alt="' + title + '"></div>';
                }).join("") +
            "</div>";

        content.insertAdjacentElement("afterend", box);

        const stage = box.querySelector(".ds-stage");
        const cards = Array.prototype.slice.call(box.querySelectorAll(".ds-card"));
        const mid = n >= 3 ? Math.floor(n / 2) : -1;   
        const pos = cards.map(function (_, i) { return i; });

        stage.style.setProperty("--n", n);

        function setSlot(card, p) {
            card.style.setProperty("--slot", p);
            card.style.setProperty("--s", p === mid ? 1.06 : 1);
            card.style.zIndex = p === mid ? 2 : 1;
            card.classList.toggle("is-mid", p === mid);
        }

        cards.forEach(function (c, i) { setSlot(c, pos[i]); });

        function rotate() {
            if (!box.isConnected) { stop(); return; }
            cards.forEach(function (c, i) {
                const wrap = pos[i] === 0;            
                pos[i] = (pos[i] - 1 + n) % n;
                if (wrap) {
                    c.classList.add("is-leaving");
                    setTimeout(function () {
                        c.classList.add("is-jump");
                        setSlot(c, pos[i]);
                        void c.offsetWidth;            
                        c.classList.remove("is-jump");
                        c.classList.remove("is-leaving");
                    }, 450);
                } else {
                    setSlot(c, pos[i]);
                }
            });
        }

        function start() {
            stop();
            if (n > 1) timer = setInterval(rotate, DELAY);
        }

        stage.addEventListener("mouseenter", stop);    
        stage.addEventListener("mouseleave", start);
        start();
    }

    const observer = new MutationObserver(function () {
        if (busy) return;
        busy = true;
        requestAnimationFrame(function () {
            const d = document.querySelector(".image-detail.active");
            if (d) { build(d); } else { stop(); }
            busy = false;
        });
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["class"]
    });

})();