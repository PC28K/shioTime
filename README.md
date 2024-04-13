# shioTime

JSON形式で書かれた列車運転時刻表を表示するものです。

時刻表ファイルの形式についてはsample.jsonとsample2.jsonを参考してください。

------
#### OuDia2から出力されたCSV時刻表ファイルを読み込んで表示することができます。
 * コロン無し、秒付き形式に対応しています。
 * 複数ファイル選択ができますので上り下り時刻表を同時に読ませるといいです。
 * WEB上で簡易CSV読み込み機能を提供しています。
 * bundleフォルダの中にあるoudia2shio.jsをnodeで実行するとCSVをJSONファイルに変換できます。

-----
#### 2024/04/13 更新
 * 仕業から列車を選択する画面を行路表に変更しました。
   - 対応にはJSONの内容を変更、もしくは更新されたou→shio変換スクリプトで新しく変換する必要があります。
 * スクリプトでou→shio変換する際に日付変更線を指定できるようにしました。
 * config.jsに24:59:59以後の時刻を01:00:00にするか25:00:00にするかの設定を付けました。


