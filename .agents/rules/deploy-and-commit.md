---
trigger: always_on
---

# コード変更後の必須手順

ivy-appプロジェクトでコードを変更した場合、必ず以下を**忘れずに実施**すること：

## 1. Firebaseデプロイ（Hosting）
```bash
npx -y firebase-tools@latest deploy --only hosting
```

## 2. Gitコミット＆プッシュ
```bash
git add <変更ファイル>
git commit -m "<わかりやすいコミットメッセージ>"
git push origin main
```

## 注意事項
- コード変更のたびに必ずこの2ステップをセットで実施する
- ユーザーに確認を求めず、変更完了後に自動で実施する
- コミットメッセージは日本語で、変更内容がわかるように記載する
