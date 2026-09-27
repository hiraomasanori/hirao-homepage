(function () {
  "use strict";

  const contentPanel = document.getElementById("contentPanel");
  const menuButtons = Array.from(document.querySelectorAll("[data-menu]"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const noteIndex = document.getElementById("noteIndex");
  const notePreview = document.getElementById("notePreview");

  let articles = [];
  let selectedArticle = 0;

  function escapeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // 1. タブ（セクション）切り替え
  function changeSection(sectionId) {
    sections.forEach((sec) => sec.classList.toggle("active", sec.dataset.section === sectionId));
    menuButtons.forEach((btn) => {
      const active = btn.dataset.menu === sectionId;
      btn.classList.toggle("active", active);
      if (active) btn.setAttribute("aria-current", "page");
      else btn.removeAttribute("aria-current");
    });
    contentPanel.classList.toggle("note-active", sectionId === "note");
    contentPanel.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth <= 820) {
      contentPanel.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }

  menuButtons.forEach((btn) => btn.addEventListener("click", () => changeSection(btn.dataset.menu)));

  // 2. NOTE記事の描画
  function renderArticleList() {
    if (!noteIndex || !notePreview) return;
    if (articles.length === 0) {
      noteIndex.innerHTML = '<div class="frame-label">記事一覧</div><p class="article-status">記事がありません</p>';
      notePreview.innerHTML = '<p class="article-status">noteで最新の記事をご覧ください。</p>';
      return;
    }

    noteIndex.innerHTML = `<div class="frame-label">記事一覧（${articles.length}件）</div>`;
    articles.forEach((article, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === selectedArticle ? "note-item active" : "note-item";
      button.innerHTML = `<time>${escapeText(article.date)}</time><strong>${escapeText(article.title)}</strong>`;
      button.addEventListener("click", () => renderArticle(index));
      noteIndex.appendChild(button);
    });
    renderArticle(0);
  }

  function renderArticle(index) {
    const article = articles[index];
    if (!article || !notePreview) return;
    selectedArticle = index;

    document.querySelectorAll(".note-item").forEach((btn, idx) => {
      btn.classList.toggle("active", idx === index);
    });

    const cover = article.image
      ? `<img class="note-cover" src="${escapeText(article.image)}" alt="" />`
      : "";
    // 本文全文HTMLを出力
    const body = article.body || "<p>本文はnoteでご覧ください。</p>";

    notePreview.innerHTML = `
      <div class="frame-label">記事本文</div>
      <div class="note-article">
        <time>${escapeText(article.date)}</time>
        <h3>${escapeText(article.title)}</h3>
        ${cover}
        <div class="note-article-body">${body}</div>
        <a class="note-external-link" href="${escapeText(article.url)}" target="_blank" rel="noreferrer">noteでこの記事を開く ↗</a>
      </div>`;
    notePreview.scrollTop = 0;
  }

  // 3. NOTE記事の読み込み（GitHub Actionsで自動更新される全文JSONを取得）
  async function fetchNoteArticles() {
    try {
      const res = await fetch('articles.json?t=' + Date.now()); // キャッシュ防止パラメータ付き
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          articles = data;
          renderArticleList();
          return;
        }
      }
    } catch (e) {
      console.warn("articles.json read failed:", e);
    }
    renderArticleList();
  }

  // 4. 画像エラー処理
  document.querySelectorAll("[data-hide-on-error]").forEach((img) => {
    img.addEventListener("error", () => img.classList.add("image-missing"));
  });
  document.querySelectorAll("[data-hide-parent-on-error]").forEach((img) => {
    img.addEventListener("error", () => {
      img.classList.add("image-missing");
      img.parentElement?.classList.add("image-missing");
    });
  });

  // 5. 寄付フォーム（Googleフォーム直結）
  const donationForm = document.getElementById("donationForm");
  const inputStep = document.getElementById("donationInputStep");
  const confirmStep = document.getElementById("donationConfirmStep");
  const completeStep = document.getElementById("donationCompleteStep");
  const nationality = document.getElementById("nationalityConfirmation");
  const confirmButton = document.getElementById("confirmDonation");
  const backButton = document.getElementById("backDonation");
  const amountInput = document.getElementById("donorAmount");
  let donationStep = "input";
  let composingAmount = false;

  function normalizeNumericInput(value) {
    return String(value)
      .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
      .replace(/[^0-9]/g, "");
  }

  if (amountInput) {
    amountInput.addEventListener("compositionstart", () => { composingAmount = true; });
    amountInput.addEventListener("compositionend", () => {
      composingAmount = false;
      amountInput.value = normalizeNumericInput(amountInput.value);
    });
    amountInput.addEventListener("input", () => {
      if (!composingAmount) amountInput.value = normalizeNumericInput(amountInput.value);
    });
    amountInput.addEventListener("blur", () => {
      amountInput.value = normalizeNumericInput(amountInput.value);
    });
  }

  if (nationality && confirmButton) {
    nationality.addEventListener("change", () => {
      confirmButton.disabled = !nationality.checked;
    });
  }

  function fieldValue(id) {
    return document.getElementById(id)?.value ?? "";
  }

  function scrollDonationTarget(target) {
    if (!target || !contentPanel || window.innerWidth <= 820) return;
    const panelRect = contentPanel.getBoundingClientRect();
    const targetRect = target.getBoundingClientRect();
    const targetTop = contentPanel.scrollTop + targetRect.top - panelRect.top - 14;
    contentPanel.scrollTo({ top: Math.max(0, targetTop), behavior: "smooth" });
  }

  function showConfirmation() {
    const receipt = document.getElementById("receiptRequest")?.checked;
    const amount = Number(fieldValue("donorAmount")).toLocaleString("ja-JP");
    document.getElementById("confirmationList").innerHTML = [
      ["氏名", fieldValue("donorName")],
      ["住所", fieldValue("donorAddress")],
      ["職業", fieldValue("donorOccupation")],
      ["メールアドレス", fieldValue("donorEmail")],
      ["寄付予定額", `${amount}円`],
      ["領収書の発行", receipt ? "希望する" : "希望しない"],
      ["日本国籍", "はい"],
    ].map(([term, value]) => `<div><dt>${term}</dt><dd>${escapeText(value)}</dd></div>`).join("");

    inputStep.hidden = true;
    confirmStep.hidden = false;
    donationStep = "confirm";
    window.requestAnimationFrame(() => scrollDonationTarget(confirmStep));
  }

  if (donationForm) {
    donationForm.addEventListener("submit", (event) => {
      if (donationStep === "input") {
        event.preventDefault();
        amountInput.value = normalizeNumericInput(amountInput.value);
        if (!donationForm.reportValidity() || !nationality.checked) return;
        showConfirmation();
        return;
      }
      donationStep = "complete";
      window.setTimeout(() => {
        donationForm.hidden = true;
        completeStep.hidden = false;
        window.requestAnimationFrame(() => {
          scrollDonationTarget(completeStep.querySelector(".bank-details") || completeStep);
        });
      }, 0);
    });
  }

  if (backButton) {
    backButton.addEventListener("click", () => {
      confirmStep.hidden = true;
      inputStep.hidden = false;
      donationStep = "input";
    });
  }

  // 起動時に最新の全文記事を読み込む
  fetchNoteArticles();
})();
