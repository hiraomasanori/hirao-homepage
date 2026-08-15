# 平尾正憲 公式サイト

平尾正憲後援会の公式ホームページです。

## GitHubへの配置

1. ZIPを展開し、中のファイルとフォルダをGitHubリポジトリへアップロードします。
2. 既存の画像を次の場所へ配置します。
   - `header.png` → `public/header.png`
   - `yokonaga.png` → `public/yokonaga.png`
3. Node.js 22.13以降の環境で依存関係をインストールし、ビルドします。

```bash
pnpm install
pnpm build
```

## 公開について

NOTEの記事一覧・記事本文をサーバー側で取得するため、静的ファイルだけのGitHub Pagesでは動作しません。GitHubのリポジトリをCloudflare、Vercel、または同等のNext.js対応サービスへ接続して公開してください。

## 主な編集箇所

- ページ内容・フォーム：`app/SiteHome.tsx`
- 色・配置・スマホ表示：`app/globals.css`
- NOTE記事取得：`app/note-data.ts`
- NOTE本文取得：`app/api/note/[id]/route.ts`
