(function () {
  "use strict";

  const articles = Array.isArray(window.__NOTE_ARTICLES__) ? window.__NOTE_ARTICLES__ : [];
  const contentPanel = document.getElementById("contentPanel");
  const menuButtons = Array.from(document.querySelectorAll("[data-menu]"));
  const sections = Array.from(document.querySelectorAll("[data-section]"));
  const noteIndex = document.getElementById("noteIndex");
  const notePreview = document.getElementById("notePreview");
  let selectedArticle = 0;

  function escapeText(value) {
    return String(value ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function changeSection(sectionId) {
    sections.forEach((section) => section.classList.toggle("active", section.dataset.section === sectionId));
    menuButtons.forEach((button) => {
      const active = button.dataset.menu === sectionId;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    contentPanel.classList.toggle("note-active", sectionId === "note");
    contentPanel.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth <= 820) contentPanel.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  menuButtons.forEach((button) => button.addEventListener("click", () => changeSection(button.dataset.menu)));

  function renderArticle(index) {
    const article = articles[index];
    if (!article || !notePreview) return;
    selectedArticle = index;
    document.querySelectorAll(".note-item").forEach((button, buttonIndex) => {
      button.classList.toggle("active", buttonIndex === index);
    });
    const cover = article.image
      ? `<img class="note-cover" src="${escapeText(article.image)}" alt="" />`
      : "";
    const body = article.body || (article.excerpt ? `<p>${escapeText(article.excerpt)}</p>` : "<p>本文はnoteでご覧ください。</p>");
    notePreview.innerHTML = `
      <div class="frame-label">記事本文</div>
      <div class="note-article">
        <time>${escapeText(article.date)}</time>
        <h3>${escapeText(article.title)}</h3>
        ${cover}
        <div class="note-article-body">${body}</div>
        <a class="note-external-link" href="${escapeText(article.url)}" target="_blank" rel="noreferrer">noteでこの記事を開く</a>
      </div>`;
    notePreview.scrollTop = 0;
  }

  if (noteIndex && notePreview) {
    noteIndex.innerHTML = `<div class="frame-label">記事一覧（${articles.length}件）</div>`;
    articles.forEach((article, index) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = index === selectedArticle ? "note-item active" : "note-item";
      button.innerHTML = `<time>${escapeText(article.date)}</time><strong>${escapeText(article.title)}</strong>`;
      button.addEventListener("click", () => renderArticle(index));
      noteIndex.appendChild(button);
    });
    if (articles.length) renderArticle(0);
    else notePreview.innerHTML = '<p class="article-status">NOTE記事を取得できませんでした。</p>';
  }

  document.querySelectorAll("[data-hide-on-error]").forEach((image) => {
    image.addEventListener("error", () => image.classList.add("image-missing"));
  });
  document.querySelectorAll("[data-hide-parent-on-error]").forEach((image) => {
    image.addEventListener("error", () => {
      image.classList.add("image-missing");
      image.parentElement?.classList.add("image-missing");
    });
  });

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
    amountInput.addEventListener("blur", () => { amountInput.value = normalizeNumericInput(amountInput.value); });
  }

  if (nationality && confirmButton) {
    nationality.addEventListener("change", () => { confirmButton.disabled = !nationality.checked; });
  }

  function fieldValue(id) {
    return document.getElementById(id)?.value ?? "";
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
    contentPanel.scrollTo({ top: 0, behavior: "smooth" });
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
        contentPanel.scrollTo({ top: 0, behavior: "smooth" });
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
})();
