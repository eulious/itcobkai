# 概要
サークルのOB会を大人数で行うために作成したボイスチャット兼Wikiです。

# とりあえず試す
1. Node.jsをインストール
1. このリポジトリのコードを`git clone`又はダウンロード
1. [これ](https://itcobkai.s3.ap-northeast-1.amazonaws.com/sample/itcobkai.zip)を展開して各ディレクトリに配置
1. src/rtc/viewer/Viewer.tsxの以下の行を編集

```typescript
// 以下をコメントアウト
ct.init(res.profiles, rtc.message)
rtc.start(ct.player!.profile, ct.player!.id, localAudio.current!, remoteAudio.current!, receive)

// 以下のコメントアウトを解除
ct.init(res.profiles, console.log)
ct.start(5, 4)
ct.join(res.profiles["2Jc4uot"], "2Jc4uot", 6, 7)
ct.join(res.profiles["C3kjj1X"], "C3kjj1X", 6, 6)
```

5. 以下のコマンドを実行
```
$ npm install
$ npm start
```

# デプロイ
## AWSの設定
### S3
以下の構造でバケットとオブジェクトを作成
```
itcobkai (公開バケット)
├- assets/
│  ├- favicon.png
│  ├- hakase.jpg
│  ├- map_b.png
│  └- map_t.png
├- build/
└- note/

itcobkai-internal (非公開のバケット)
└- md/
```

### lambda
以下の関数を作成
- itcobkai
  - AmazonS3FullAccessをアタッチ
  - AmazonDynamoDBFullAccessをアタッチ
  - lambdaディレクトリ直下のにあるPythonファイルを配置(tools/lambda.sh)
  - profiles.pyを配置
  - 以下の形式のkey.pyを作成(kinesisとskywayはどちらか一方のみでOK)

```python
KEYS = {
    "AWS_REGION": 'kinesisのリージョン',
    "AWS_CHANNEL_ARN": 'kinesisのチャンネル',
    "AWS_ACCESS_KEY_ID": 'kinesisのアクセス鍵',
    "AWS_SECRET_ACCESS_KEY": 'kinesisの秘密鍵',
    "AWS_CH_NAME": 'kinesisのチャンネル名',
    "SKYWAY": "skywayのキー"
}

S3_PUBLIC = "itcobkai"
S3_INTERNAL = "itcobkai-internal"
```

- itcobkai-requests
  - [ここ](https://sebenkyo.com/2021/05/21/post-1979/)を参考にrequests(外部ライブラリ)をレイヤーとして追加
  - AWSLambdaRoleをアタッチ
  - lambda/discord.pyの内容をlambda_function.pyにコピー
  - 以下の形式のkey.pyを作成

```python
DISCORD = {
    "CLIENT_ID": "Discord APIのID",
    "CLIENT_SECRET": "Discord APIのシークレットキー"
}
```

### DynamoDB
以下のテーブルを作成する。全て「設定をカスタマイズ」からオンデマンドキャパシティーモードを選択する。

| テーブル名 | パーティションキー | ソートキー | TTL |
| - | - | - | - |
| itcobkai | token (String) | | expired_at | 
| itcobkai_notes | id (String) | | |
| itcobkai_unreads | user_id (String) | note_id (String) | |
| itcobkai_status | mode (String) | | |


### Amazon API Gateway
以下の２つのエンドポイントを設定デプロイする。ステージからURLを控えておく。
- POST /
  - lambda統合でitcobkaiと紐付ける
- POST /discord
  - lambda統合でitcobkai_requestsと紐付ける


### Kinesis Video Streams
skywayの方が圧倒的に使いやすい上に無料なので現在は使っていない。


## フロント側の設定
1. AWS SDK for Pythonをインストール
1. 「とりあえず試す」の項目４以外を全て行う
1. src/common/Config.jsで`LAMBDA_URL`と`S3_URL`を設定
1. 以下のコマンドを実行

```
$ npm run build
```

# その他
マップの素材は[ドット絵世界](http://yms.main.jp)さんからお借りしています。