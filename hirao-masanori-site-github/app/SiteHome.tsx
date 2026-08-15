"use client";

import { FormEvent, useRef, useState } from "react";

export type NoteArticle = {
  title: string;
  date: string;
  url: string;
  noteId: string;
  image: string;
  excerpt: string;
};

type SectionId = "platform" | "policy" | "profile" | "note" | "donation" | "contact";
type DonationStep = "input" | "confirm" | "complete";

const menuItems: { id: SectionId; label: string }[] = [
  { id: "platform", label: "綱領" },
  { id: "policy", label: "政策方針" },
  { id: "profile", label: "自己紹介" },
  { id: "note", label: "NOTE" },
  { id: "donation", label: "ご寄付のお願い" },
  { id: "contact", label: "お問い合わせ・SNS" },
];

const socialLinks = [
  { label: "NOTE記事", icon: "/note.png", url: "https://note.com/hirao_masanori" },
  { label: "X", icon: "/x.png", url: "https://x.com/hirao_masanori" },
  {
    label: "instagram",
    icon: "/instagram.png",
    url: "https://www.instagram.com/hirao_masanori/",
  },
  {
    label: "Facebook",
    icon: "/facebook.png",
    url: "https://www.facebook.com/share/1Jz9qDszKY/",
  },
  {
    label: "threads -日常-",
    icon: "/threads.png",
    url: "https://www.threads.com/@hirao_masanori",
  },
  {
    label: "youtube",
    icon: "/youtube.png",
    url: "https://www.youtube.com/@%E5%B9%B3%E5%B0%BE%E6%AD%A3%E6%86%B2",
  },
];

const googleFormAction =
  "https://docs.google.com/forms/d/e/1FAIpQLSff1jcsB4j1z0iCc6HSA6gsJJUjj4R9qKq-eigsLg-qadNKtA/formResponse";

function normalizeNumericInput(value: string) {
  return value
    .replace(/[０-９]/g, (digit) => String.fromCharCode(digit.charCodeAt(0) - 0xfee0))
    .replace(/[^0-9]/g, "");
}

function DonationForm() {
  const [step, setStep] = useState<DonationStep>("input");
  const amountCompositionRef = useRef(false);
  const [form, setForm] = useState({
    name: "",
    address: "",
    occupation: "",
    email: "",
    amount: "",
    receipt: false,
    nationality: false,
  });

  const update = (field: keyof typeof form, value: string | boolean) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const showConfirmation = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!form.nationality) return;
    setStep("confirm");
  };

  if (step === "complete") {
    return (
      <div className="donation-complete" role="status" aria-live="polite">
        <div className="complete-mark" aria-hidden="true">✓</div>
        <h3>お申し込みありがとうございます。</h3>
        <p>以下の口座へお振込みください。</p>
        <div className="bank-details">
          <p>多摩信用金庫</p>
          <p>三鷹下連雀支店（010）</p>
          <p>普通{"　"}2658223</p>
          <p>ヒラオマサノリコウエンカイ</p>
        </div>
        <p className="form-note">
          ※振込名義は、フォーム入力の氏名と一致するようお願いいたします。
        </p>
      </div>
    );
  }

  if (step === "confirm") {
    return (
      <form
        className="confirmation-card"
        action={googleFormAction}
        method="post"
        target="google-form-target"
        onSubmit={() => setStep("complete")}
      >
        <h3>入力内容の確認</h3>
        <p className="confirmation-lead">内容をご確認のうえ、送信してください。</p>
        <dl className="confirmation-list">
          <div><dt>氏名</dt><dd>{form.name}</dd></div>
          <div><dt>住所</dt><dd>{form.address}</dd></div>
          <div><dt>職業</dt><dd>{form.occupation}</dd></div>
          <div><dt>メールアドレス</dt><dd>{form.email}</dd></div>
          <div><dt>寄付予定額</dt><dd>{Number(form.amount).toLocaleString("ja-JP")}円</dd></div>
          <div><dt>領収書の発行</dt><dd>{form.receipt ? "希望する" : "希望しない"}</dd></div>
          <div><dt>日本国籍</dt><dd>はい</dd></div>
        </dl>

        <input type="hidden" name="entry.50641209" value={form.name} />
        <input type="hidden" name="entry.1720299046" value={form.address} />
        <input type="hidden" name="entry.1402773033" value={form.occupation} />
        <input type="hidden" name="entry.2144689984" value={form.email} />
        <input type="hidden" name="entry.1795677886" value={form.amount} />
        {form.receipt && <input type="hidden" name="entry.171134634" value="希望する" />}
        <input type="hidden" name="entry.629862955" value="はい" />

        <div className="form-actions">
          <button className="button-secondary" type="button" onClick={() => setStep("input")}>
            戻る
          </button>
          <button className="button-primary" type="submit">送信</button>
        </div>
      </form>
    );
  }

  return (
    <form className="donation-form" onSubmit={showConfirmation}>
      <div className="field-grid">
        <label className="form-field">
          <span>氏名 <em>必須</em></span>
          <input
            type="text"
            value={form.name}
            onChange={(event) => update("name", event.target.value)}
            autoComplete="name"
            required
          />
        </label>
        <label className="form-field full">
          <span>住所 <em>必須</em></span>
          <input
            type="text"
            value={form.address}
            onChange={(event) => update("address", event.target.value)}
            autoComplete="street-address"
            required
          />
        </label>
        <label className="form-field">
          <span>職業 <em>必須</em></span>
          <input
            type="text"
            value={form.occupation}
            onChange={(event) => update("occupation", event.target.value)}
            autoComplete="organization-title"
            required
          />
        </label>
        <label className="form-field">
          <span>メールアドレス <em>必須</em></span>
          <input
            type="email"
            value={form.email}
            onChange={(event) => update("email", event.target.value)}
            autoComplete="email"
            required
          />
        </label>
        <label className="form-field">
          <span>寄付予定額 <em>必須</em></span>
          <span className="amount-input">
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={form.amount}
              onCompositionStart={() => {
                amountCompositionRef.current = true;
              }}
              onCompositionEnd={(event) => {
                amountCompositionRef.current = false;
                update("amount", normalizeNumericInput(event.currentTarget.value));
              }}
              onChange={(event) =>
                update(
                  "amount",
                  amountCompositionRef.current
                    ? event.currentTarget.value
                    : normalizeNumericInput(event.currentTarget.value),
                )
              }
              onBlur={(event) => update("amount", normalizeNumericInput(event.currentTarget.value))}
              required
            />
            <b>円</b>
          </span>
        </label>
      </div>

      <label className="check-row" htmlFor="receipt-request">
        <span>領収書の発行を希望する<small>※領収書を発行した場合でも、寄附金控除・税額控除の対象にはなりません。</small></span>
        <input
          id="receipt-request"
          type="checkbox"
          checked={form.receipt}
          onChange={(event) => update("receipt", event.target.checked)}
        />
      </label>

      <label className="check-row nationality-check" htmlFor="nationality-confirmation">
        <span>日本国籍ですか？{"　"}はい<small>「はい」にチェックしないと送信できません。</small></span>
        <input
          id="nationality-confirmation"
          type="checkbox"
          checked={form.nationality}
          onChange={(event) => update("nationality", event.target.checked)}
          required
        />
      </label>

      <div className="form-actions single">
        <button className="button-primary" type="submit" disabled={!form.nationality}>確認</button>
      </div>
    </form>
  );
}

export default function SiteHome({
  articles,
  initialArticleBody,
}: {
  articles: NoteArticle[];
  initialArticleBody: string;
}) {
  const [activeSection, setActiveSection] = useState<SectionId>("profile");
  const [selectedArticle, setSelectedArticle] = useState(0);
  const [articleBodies, setArticleBodies] = useState<Record<string, string>>(() =>
    articles[0]?.noteId && initialArticleBody
      ? { [articles[0].noteId]: initialArticleBody }
      : {},
  );
  const [loadingArticleId, setLoadingArticleId] = useState("");
  const [articleError, setArticleError] = useState("");
  const contentPanelRef = useRef<HTMLElement>(null);
  const articleRequestRef = useRef(0);
  const article = articles[selectedArticle] ?? articles[0];
  const articleBody = article ? articleBodies[article.noteId] : "";

  const selectArticle = async (index: number) => {
    const nextArticle = articles[index];
    if (!nextArticle) return;

    const requestId = articleRequestRef.current + 1;
    articleRequestRef.current = requestId;
    setSelectedArticle(index);
    setArticleError("");
    if (articleBodies[nextArticle.noteId]) {
      setLoadingArticleId("");
      return;
    }
    setLoadingArticleId(nextArticle.noteId);

    try {
      const response = await fetch(`/api/note/${encodeURIComponent(nextArticle.noteId)}`);
      if (!response.ok) throw new Error("記事を読み込めませんでした。");
      const payload = (await response.json()) as { body?: string };
      if (requestId !== articleRequestRef.current || !payload.body) return;
      setArticleBodies((current) => ({ ...current, [nextArticle.noteId]: payload.body ?? "" }));
    } catch {
      if (requestId === articleRequestRef.current) {
        setArticleError("記事を読み込めませんでした。noteで全文をご覧ください。");
      }
    } finally {
      if (requestId === articleRequestRef.current) setLoadingArticleId("");
    }
  };

  const changeSection = (id: SectionId) => {
    setActiveSection(id);
    contentPanelRef.current?.scrollTo({ top: 0, behavior: "smooth" });
    if (window.innerWidth <= 820) {
      contentPanelRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <main className="site-shell">
      <header className="hero-banner" aria-label="平尾正憲 公式サイト">
        <img
          className="hero-banner-image"
          src="/header.png"
          alt=""
          onError={(event) => {
            event.currentTarget.classList.add("image-missing");
            event.currentTarget.parentElement?.classList.add("image-missing");
          }}
        />
      </header>

      <div className="main-layout">
        <section
          className={activeSection === "note" ? "content-panel note-active" : "content-panel"}
          ref={contentPanelRef}
        >
          <article className={activeSection === "profile" ? "content-section active" : "content-section"}>
            <div className="section-title"><p className="eyebrow">PROFILE</p><h2>自己紹介</h2></div>
            <p className="lead">平尾正憲。三鷹市から、将来世代に責任ある政治を目指します。</p>
            <p>現役世代の負担、行政運営の透明性、社会制度の持続可能性を重視し、短期的な人気取りではなく、長期的に地域と社会を支える政治を目指します。</p>
            <p>政治に必要なのは、声の大きさではなく、制度を理解し、課題を整理し、実行可能な形に落とし込む力だと考えています。</p>
            <h3>重視する姿勢</h3>
            <ul className="principle-list">
              <li>現役世代の負担を軽視しないこと</li>
              <li>将来世代にツケを回さないこと</li>
              <li>行政の使途と効果を分かりやすくすること</li>
              <li>感情論ではなく、制度と現実に基づいて判断すること</li>
            </ul>
          </article>

          <article className={activeSection === "platform" ? "content-section active" : "content-section"}>
            <div className="section-title"><p className="eyebrow">PLATFORM</p><h2>平尾正憲後援会{"　"}綱領</h2></div>
            <p>政治の役目は、社会の現実に向き合い、人々の暮らしを守り、地域と国の未来をより良い形で次世代へ引き継ぐことにあると考えます。そのために必要なのは、現実を正確に見つめ、物事の因果関係や構造を整理し、対立する利害を調整しながら、着実に前へ進める政治です。</p>
            <h3>将来世代に責任ある政治へ</h3>
            <p>今を生きる私たちは、先人から、歴史や文化に加えて、地域社会と公共の基盤を受け継いでいます。</p>
            <p>それをただ消費するのではなく、より安定し、持続可能で、負担の少ない形で子や孫の世代へ手渡していく責任があります。今の世代からまず負担を軽くしなければ、持続可能な未来にはつながりません。財政、教育、子育て、福祉、安全、地域経済、地域社会のつながりなど、暮らしを支える基盤を浪費せず、将来にわたって機能する社会を築くことが、本当の意味で国や社会を愛することだと考えます。</p>
            <h3>安定と調和を次世代へ</h3>
            <p>社会は、多様な立場や価値観、異なる事情を抱える人々によって成り立っています。政治は、対立のためにあるのではなく、それぞれの立場に配慮しながら、社会全体としてより良い均衡を見いだし、地域に暮らす人々が安心して生活し、将来への見通しを持てる社会を守るためにあります。</p>
            <p>政治課題には、それぞれ原因と背景と構造があり、表面に見える現象だけに反応しても、本当の解決にはつながりません。だからこそ、感覚や印象だけで判断するのではなく、事実を確認し、因果関係を見極め、長期的な影響まで考えたうえで、現実に機能する解決策を積み重ねていかなければなりません。</p>
            <p>人々の利益にかなう現実的な判断を重ねる政治こそ、本当の意味での保守だと考えます。</p>
            <h3>いちばん大切なものは目には見えない</h3>
            <p>私たちは、目に見えるものだけが価値の本質ではないと考えます。人々の安心、信頼、時間のゆとり、落ち着いて判断できる環境、将来への希望、地域のつながりは、数字に表れにくくとも社会を支える大切な基盤です。時間は、人の生と社会の営みを支え、価値を生み出す、限られた資源です。失われた時間は戻らず、無駄に費やされた時間は、個人にとっても社会にとっても、取り返すことのできない損失となります。</p>
            <p>また、人々が考え理解し選択する力も限られた資源です。無用な対立、過度な混乱、不透明な意思決定、非合理な制度運用は、人々の時間と判断の余力を奪い、社会に見えにくい損失を生みます。政治は、不安や怒りを利用するのではなく、複雑な現実を整理し、見通しを示し、社会全体がより良い判断を行える条件を整えるものでなければなりません。</p>
            <p>私たちは、最適化と合理化によって、社会の持続と発展及び、人々の幸せに資する政治を目指します。</p>
            <p>限られた財源、限られた人手、限られた時間の中で、行政や地域社会の仕組みをより良く整え、無駄を減らし、必要なところに力を注ぐことは、暮らしを守るために欠かせません。それは単なる効率の追求ではなく、社会の資源を適切に配分し、本当に必要な支えを持続的に届け、社会を成立させるための条件です。</p>
            <p>耳ざわりの良い言葉ではなく、誠実な説明、適正な運営、そして着実な実行により、安定と調和を守り、将来世代に責任を持つ、合理的で現実的な政治を通じ、社会の持続的な発展に寄与します。</p>
          </article>

          <article className={activeSection === "policy" ? "content-section active" : "content-section"}>
            <div className="section-title"><p className="eyebrow">POLICY</p><h2>政策方針</h2></div>
            <p className="lead">「何を増やすか」ではなく、「何をどう使うか」を問います。</p>
            <div className="policy-grid">
              <section><span>01</span><h3>行政事業の効果検証</h3><p>行政の事業は、実施すること自体が目的ではありません。その事業がどのような効果を生み、どの程度の費用対効果を持つのかを検証する必要があります。</p></section>
              <section><span>02</span><h3>現役世代の負担軽減</h3><p>制度を支える現役世代の負担が過剰になれば、地域の活力そのものが失われます。支える側が持続できる設計こそ、社会保障と行政運営の前提です。</p></section>
              <section><span>03</span><h3>情報の可視化</h3><p>予算、事業、効果、決定過程を分かりやすく整理し、市民が判断できる形にすることを重視します。</p></section>
            </div>
          </article>

          <article className={activeSection === "note" ? "content-section active" : "content-section"}>
            <div className="section-heading note-heading">
              <h2 className="sr-only">NOTE</h2>
              <img
                className="note-logo"
                src="/yokonaga.png"
                alt=""
                onError={(event) => event.currentTarget.classList.add("image-missing")}
              />
              <a href="https://note.com/hirao_masanori" target="_blank" rel="noreferrer">noteで記事一覧を見る</a>
            </div>
            <div className="note-layout">
              <div className="note-index" aria-label="NOTE記事一覧">
                <div className="frame-label">記事一覧（{articles.length}件）</div>
                {articles.map((item, index) => (
                  <button
                    type="button"
                    key={item.url}
                    className={selectedArticle === index ? "note-item active" : "note-item"}
                    onClick={() => void selectArticle(index)}
                  >
                    <time>{item.date}</time><strong>{item.title}</strong>
                  </button>
                ))}
              </div>
              {article && (
                <article className="note-preview" aria-busy={loadingArticleId === article.noteId}>
                  <div className="frame-label">記事本文</div>
                  <div className="note-article">
                    <time>{article.date}</time>
                    <h3>{article.title}</h3>
                    {article.image && <img className="note-cover" src={article.image} alt="" />}
                    {loadingArticleId === article.noteId && !articleBody && (
                      <p className="article-status">記事を読み込んでいます…</p>
                    )}
                    {articleError && !articleBody && <p className="article-status error">{articleError}</p>}
                    {articleBody && (
                      <div
                        className="note-article-body"
                        dangerouslySetInnerHTML={{ __html: articleBody }}
                      />
                    )}
                    <a className="note-external-link" href={article.url} target="_blank" rel="noreferrer">
                      noteでこの記事を開く
                    </a>
                  </div>
                </article>
              )}
            </div>
          </article>

          <article className={activeSection === "donation" ? "content-section active" : "content-section"}>
            <div className="section-title"><p className="eyebrow">SUPPORT</p><h2>ご寄付のお願い</h2></div>
            <div className="donation-box">
              <h3>寄付申込フォーム</h3>
              <div className="donation-notice">
                <p>※氏名・住所・職業は、寄附者確認および政治資金収支報告書作成のため、正確な内容をご入力ください。氏名は本名、住所は現住所をご入力ください。通称、ニックネーム、匿名、他人名義でのお申し込みはお受けできません。</p>
                <p>平尾正憲後援会へのご寄付は、政治活動の広報、資料作成、地域活動、事務運営等に活用いたします。</p>
                <p>三鷹市議会議員選挙に関する政治活動への寄附は、領収書を発行した場合でも、寄附金控除・税額控除の対象にはなりません。</p>
                <p>同一の方からの寄附が年間合計5万円を超える場合、政治資金収支報告書に、氏名・住所・職業・寄附金額・年月日が記載され、公開されます。</p>
                <p>年間合計5万円以下の場合は、個別の氏名・住所等は収支報告書の寄附者別内訳には記載されません。ただし、会計処理上、当会内部では申込情報を保存します。</p>
                <p>領収書を希望される場合は、ご入金の確認後、PDFにてメール送付いたします。</p>
                <p>※ご入力いただいたメールアドレス宛に、平尾正憲または後援会から、報告やお知らせを送らせていただく場合がございます。</p>
                <p>※ご入力いただいた個人情報は、寄付申込の確認、入金確認、領収書発行、政治資金収支報告書の作成、報告・お知らせの送付、その他これらに付随する事務連絡の目的に限って使用し、目的外には使用いたしません。</p>
              </div>
              <DonationForm />
              <iframe className="submission-target" name="google-form-target" title="送信先" />
            </div>
          </article>

          <article className={activeSection === "contact" ? "content-section active" : "content-section"}>
            <div className="section-title"><p className="eyebrow">CONTACT</p><h2>お問い合わせ・SNS</h2></div>
            <div className="contact-box">
              <p>ご意見、ご質問、活動へのご連絡は、メールまたは各SNSよりお願いいたします。</p>
              <div className="email-row">
                <span>📩{"　"}hirao.masanori.office@gmail.com</span>
                <a className="button-primary" href="mailto:hirao.masanori.office@gmail.com">メールを送る</a>
              </div>
              <div className="social-grid">
                {socialLinks.map((social) => (
                  <a key={social.label} href={social.url} target="_blank" rel="noreferrer" aria-label={`${social.label}を開く`}>
                    <span className="social-icon"><img src={social.icon} alt="" /></span>
                    <span>{social.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </article>
        </section>

        <aside className="side-nav" aria-label="メニュー">
          <p>MENU</p>
          <div className="nav-buttons-wrap">
            {menuItems.map((item) => (
              <button
                type="button"
                key={item.id}
                className={activeSection === item.id ? "active" : ""}
                aria-current={activeSection === item.id ? "page" : undefined}
                onClick={() => changeSection(item.id)}
              >
                {item.label}
              </button>
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
