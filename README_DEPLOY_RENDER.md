## Render にデプロイする手順（最も簡単で安定した公開方法）

以下は「最小の手間」でこのリポジトリを公開するための手順です。トンネルは使わず、Render の Web Service（Docker または Node）を使います。

前提
- リポジトリを GitHub にプッシュできること（認証は各自の GitHub アカウントで行います）
- Render のアカウント（無料枠で試せます）

手順（概略）
1. GitHub に新しいリポジトリを作成する
   - GitHub にログインして新しいリポジトリを作成してください（例: `ghost-house`）。

2. ローカルの変更をコミットして GitHub にプッシュする
   端末でこのリポジトリのルートで以下を実行します:

```bash
git init
git add .
git commit -m "Prepare app for Render deployment"
# リモートリポジトリURLは GitHub が発行するものに置き換えてください
git remote add origin git@github.com:<あなたのユーザ名>/<repo名>.git
git branch -M main
git push -u origin main
```

3. Render にログインして新しい Web Service を作る
   - Render ダッシュボードで "New" → "Web Service" を選択
   - GitHub を接続して先ほどのリポジトリを選ぶ
   - デプロイ方法: **Dockerfile がある場合は Docker を選ぶか、自動検出で OK**。
     - このリポジトリには `Dockerfile` があるので、Docker を選べば Render がそれを使ってビルドします。
   - ビルドコマンド / Start コマンド:
     - Docker を使う場合: Render は `Dockerfile` の `CMD` をそのまま使います（何も設定不要）。
     - Docker を使わない場合: ビルドコマンドは `npm ci`、Start コマンドは `npm start` を指定してください。
   - Environment: `Node`（Docker を使う場合は Render の Docker を選択）
   - ポート: Render は環境変数 `PORT` を提供します。`server.js` は `process.env.PORT || 3000` を使っているためそのままで大丈夫です。

4. デプロイの確認
   - Render がビルド/デプロイを自動で行い、公開 URL が発行されます。
   - 発行された URL にアクセスして、チャット UI が表示され、PDF を含む機能が動くことを確認してください。

注意点とトラブルシュート
- PDF を `current_newsparer/` に置いておくとサーバーは `/files/第一幽霊の過去.pdf` で配信します。
- Render のログ（Deploy → Live Logs）で起動ログ/エラーを確認できます。
- もし 403/404 が出る場合はファイルが正しくコミットされているか確認してください（`git ls-files` で確認できます）。

ヘルプ（私が代行できること）
- GitHub にプッシュするコマンドの作成・コミット（ただし GitHub 認証はユーザー側で実行してください）
- Render 用の `render.yaml` を追加して Infrastructure as Code 化する（希望があれば作成します）

必要なら、今このリポジトリを GitHub にプッシュするためのコミット作業を一緒に進めます。どうしますか？
