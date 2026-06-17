// BrandBookCard.jsx
// Drop-in portfolio component for The Yellow Front Door.
// Shows the Fin & Oak brand book cover as a clickable card (opens the full
// book in a new tab) with a label/button beside it.
//
// SETUP — both files go in your repo's /public folder:
//   /public/finoak-brand-book.html   (the brand book)
//   /public/finoak-cover.png         (the cover thumbnail)
// Then import and use <BrandBookCard /> anywhere on your portfolio page.

export default function BrandBookCard() {
  const BOOK_URL = "/finoak-brand-book.html";
  const COVER_SRC = "/finoak-cover.png";

  return (
    <a
      href={BOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="fob-card"
      aria-label="Open the Fin & Oak brand book in a new tab"
    >
      <style>{`
        .fob-card{
          display:flex;
          align-items:center;
          gap:2rem;
          max-width:680px;
          text-decoration:none;
          color:inherit;
          padding:1.25rem;
          border-radius:14px;
          background:transparent;
          transition:transform .35s cubic-bezier(.2,.7,.2,1), box-shadow .35s ease;
        }
        .fob-card:hover{ transform:translateY(-4px); }
        .fob-cover-wrap{
          flex:none;
          width:190px;
          border-radius:8px;
          overflow:hidden;
          box-shadow:0 12px 34px rgba(7,79,109,.22);
          transition:box-shadow .35s ease, transform .35s cubic-bezier(.2,.7,.2,1);
        }
        .fob-card:hover .fob-cover-wrap{
          box-shadow:0 22px 54px rgba(7,79,109,.34);
          transform:scale(1.02);
        }
        .fob-cover-wrap img{ display:block; width:100%; height:auto; }
        .fob-meta{ display:flex; flex-direction:column; gap:.55rem; }
        .fob-eyebrow{
          font-family:'Lato',system-ui,sans-serif;
          font-weight:700; font-size:11px; letter-spacing:.26em;
          text-transform:uppercase; color:#8B6F47; margin:0;
        }
        .fob-title{
          font-family:'Playfair Display',Georgia,serif;
          font-size:1.65rem; line-height:1.15; color:#1A1A1A; margin:0;
        }
        .fob-desc{
          font-family:'Lato',system-ui,sans-serif;
          font-weight:300; font-size:.95rem; line-height:1.55;
          color:#5C5046; margin:0; max-width:34ch;
        }
        .fob-btn{
          display:inline-flex; align-items:center; gap:.55rem;
          align-self:flex-start; margin-top:.4rem;
          font-family:'Lato',system-ui,sans-serif;
          font-weight:700; font-size:13px; letter-spacing:.06em;
          color:#FFFDF9; background:#074F6D;
          padding:.7rem 1.2rem; border-radius:999px;
          transition:background .3s ease, gap .3s ease;
        }
        .fob-card:hover .fob-btn{ background:#053D55; gap:.85rem; }
        .fob-btn .arrow{ transition:transform .3s ease; }
        .fob-card:hover .fob-btn .arrow{ transform:translateX(3px); }
        @media(max-width:560px){
          .fob-card{ flex-direction:column; align-items:flex-start; gap:1.4rem; }
          .fob-cover-wrap{ width:100%; max-width:240px; }
        }
      `}</style>

      <div className="fob-cover-wrap">
        <img src={COVER_SRC} alt="Fin & Oak Bark Bakery brand book cover" />
      </div>

      <div className="fob-meta">
        <p className="fob-eyebrow">Brand identity · 2026</p>
        <h3 className="fob-title">Fin &amp; Oak Bark Bakery</h3>
        <p className="fob-desc">
          A full brand system for a handmade pet-treat bakery in the Annapolis
          Valley — voice, palette, typography, and a hand-drawn ear cast.
        </p>
        <span className="fob-btn">
          View the brand book
          <span className="arrow" aria-hidden="true">→</span>
        </span>
      </div>
    </a>
  );
}
