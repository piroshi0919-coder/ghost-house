**最小操作で以降自動デプロイにする手順（私がほとんど自動化）**

目的: あなたが普段何もしなくてもリポジトリを更新すれば公開側が自動的にデプロイされるように準備します。

私がやったこと（リポジトリ内）:
- `render.yaml` を追加（Render がリポジトリ連携を行うと自動的にサービス設定が読めます）
- `.github/workflows/deploy-to-render.yml` を追加（`main` に push があると Render にデプロイをトリガーできます）

ユーザーが行う最小ステップ（1回だけ）:
1. このリポジトリを GitHub にプッシュする（下のコマンドを例として端末で実行してください）

```bash
git init
git add .
git commit -m "Prepare for Render auto-deploy"
# GitHub で作成したリポジトリ URL に置き換えてください
git remote add origin git@github.com:<あなたのユーザ名>/<repo名>.git
git branch -M main
git push -u origin main
```

2. Render 側でリポジトリを接続（Web UI）するだけで以降の `main` push は自動デプロイされます。

（高度オプション）: GitHub Actions を使って Render API へ直接デプロイをトリガーするには、GitHub Secrets に `RENDER_API_KEY` と `RENDER_SERVICE_ID` を追加してください。追加後は push で自動的に Render にデプロイを実行できます。

制約と理由:
- 私はあなたの GitHub/Render 認証情報を持たないため、それらのサービスに代わって "完全に何もしない" で公開することはできません。
- ただし上記の準備により、あなたの作業は「リポジトリを GitHub に接続する（1回）」だけになります。接続後は以降何もする必要はありません。

もし望むなら、今すぐ `git push` 用のコマンドを作ってここに貼ります（実行はあなたがワンクリックで行えます）。また、私に代わって `render.yaml` を使って Render サービスを API 経由で作成して良い場合は、Render の API キーを一時的に提供する別の方法（特権を与える必要がある）について案内します。
