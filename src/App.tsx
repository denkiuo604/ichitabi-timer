import { useEffect, useState } from 'react';
import { ImGithub, ImYoutube2 } from 'react-icons/im'
import './App.css';

function App() {
  // 現在日時の取得
  const [today, setToday] = useState(new Date());

  // 公開日時設定用変数
  const pubDay = 4;
  const pubHour = 18 - today.getTimezoneOffset() / 60 - 9; // UTC+9
  const pubMinute = 0;
  const [pubMonth, pubWeek] = getPubMonthAndWeek(today);
  const tmpToday = new Date(today.getTime());
  tmpToday.setMonth(pubMonth);
  const pubDate = getNthDay(tmpToday, pubWeek, pubDay);
  const [pubTime, setPubTime] = useState(getDateWithPubTime(pubDate));

  // カウントダウン用変数
  const dayMilliSec = 60 * 60 * 24 * 1000; // 1日=(60 * 60 * 24 * 1000)ミリ秒
  const hourMilliSec = 60 * 60 * 1000; // 1時間=(60 * 60 * 1000)ミリ秒
  const minMilliSec = 60 * 1000; // 1分=(60 * 1000)ミリ秒
  const timeDiff = getTimeDiff(today, pubTime);
  const [day, setDay] = useState(timeDiff.day);
  const [hour, setHour] = useState(timeDiff.hour);
  const [minute, setMinute] = useState(timeDiff.minute);
  const [second, setSecond] = useState(timeDiff.second);

  // カウントダウンの実行
  function countdown() {
    const today = new Date();
    setToday(today);
    const [pubMonth, pubWeek] = getPubMonthAndWeek(today);
    const tmpToday = new Date(today.getTime());
    tmpToday.setMonth(pubMonth);
    const pubDate = getNthDay(tmpToday, pubWeek, pubDay);
    setPubTime(getDateWithPubTime(pubDate));

    if (pubTime.getTime() - today.getTime() >= 0) {
      const timeDiff = getTimeDiff(today, pubTime);
      setDay(timeDiff.day);
      setHour(timeDiff.hour);
      setMinute(timeDiff.minute);
      setSecond(timeDiff.second);
    }
  }
  useEffect(() => {
    const intervalId = setInterval(countdown, 1000);
    return () => clearInterval(intervalId);
  });

  // 曜日
  const days = ['日', '月', '火', '水', '木', '金', '土'];

  /**
   * その年月のd曜日を取得する関数
   * 
   * @param date - 調べたい年月の日付
   * @param day - 取得したい曜日を表す数値(0:日曜日〜6:土曜日)
   * @return ある年月のday曜日の日付の入った配列
   */
  function getDays(date: Date, day: number) {
    const year = date.getFullYear();
    const month = date.getMonth();

    const days = [];

    for (let i = 1; i <= 31; i++){
      const tmpDate = new Date(year, month, i);

      if (month !== tmpDate.getMonth()) break; //月代わりで処理終了
      if (tmpDate.getDay() !== day) continue; //引数に指定した曜日以外の時は何もしない
      days.push(tmpDate);
    }

    return days;
  }

  /**
   * その年月の第n d曜日を取得する関数
   * 
   * @param date - 調べたい年月の日付
   * @param week - 取得したい週
   * @param day - 取得したい曜日を表す数値(0:日曜日〜6:土曜日)
   * @returns ある年月の第week day曜日の日付
   */
  function getNthDay(date: Date, week: number, day: number) {
    const days = getDays(date, day);
    return days[week - 1];
  }

  /**
   * 与えられた日付の時分を公開時刻に変換する関数
   * 
   * @param date - 日付
   * @returns 時分が公開時刻に変換された日時
   */
  function getDateWithPubTime(date: Date) {
    const result = new Date(date.getTime());
    result.setHours(pubHour);
    result.setMinutes(pubMinute);
    result.setSeconds(0);
    return result;
  }

  /**
   * 次回公開日の月と週を取得する関数
   * 
   * @param date 日付
   * @returns 月と週
   */
  function getPubMonthAndWeek(date: Date): [number, number] {
    // 初期値: 当月の第2木曜日
    var month = date.getMonth();
    var week = 2;
    if (getDateWithPubTime(getNthDay(date, 4, pubDay)) < date) {
      // 次月の第2木曜日
      month += 1;
    } else if (getDateWithPubTime(getNthDay(date, 2, pubDay)) < date) {
      // 当月の第4木曜日
      week = 4;
    }
    return [month, week];
  }

  /**
   * 2つの日付の差分を返す関数
   * 
   * @param date1 - 日付1
   * @param date2 - 日付2
   * @returns 日付の差分(date2-date1)を表すオブジェクト(day: 日数, hour: 時, minute: 分, second: 秒)
   */
  function getTimeDiff(date1: Date, date2: Date) {
    const timeDiff = date2.getTime() - date1.getTime();
    const day = Math.floor(timeDiff / dayMilliSec);
    const hour = Math.floor((timeDiff - day * dayMilliSec) / hourMilliSec);
    const minute = Math.floor((timeDiff - day * dayMilliSec - hour * hourMilliSec) / minMilliSec);
    const second = Math.floor((timeDiff - day * dayMilliSec - hour * hourMilliSec - minute * minMilliSec) / 1000);
    return { day, hour, minute, second };
  }

  /**
   * number型の値にゼロ埋めを施す関数
   * @param num ゼロ埋めしたい数値
   * @param maxLength ゼロ埋め後の桁数
   * @returns ゼロ埋めされた文字列
   */
  function zeroPadding(num: number, maxLength: number) {
    return num.toString().padStart(maxLength, '0');
  }

  return (
    <div className="App">
      <header className="App-header">
        <p>今日は{today.getMonth() + 1}月{today.getDate()}日({days[today.getDay()]})</p>
        <p>「志国一路のイチ旅！」</p>
        {/* イチ旅！ 2022年8月お休み対応 */}
        <div hidden={pubTime.getMonth() + 1 !== 8}>
          <p>8月はお休みです。<br />これまでの「イチ旅！」や配信、アーカイブを楽しみましょう！</p>
        </div>
        <div hidden={pubTime.getMonth() + 1 === 8}>
          <p>次回作公開（{pubTime.getMonth() + 1}月第{pubWeek}木曜日{zeroPadding(pubHour, 2)}:{zeroPadding(pubMinute, 2)}）まで</p>
          <p>あと{day}日{hour}時間{zeroPadding(minute, 2)}分{zeroPadding(second, 2)}秒</p>
        </div>
        <div className="description">
          <div>志国一路さんのYouTubeチャンネル</div>
          <a href="https://www.youtube.com/c/ShikuniIchiro" target="_blank" rel="noreferrer" title="志国一路さんのYouTubeチャンネル">
            <ImYoutube2 size="12vmin" color="white" />
          </a>
        </div>
        <div className="description">
          <div>このアプリについて</div>
          <a href="https://github.com/denkiuo604/ichitabi-timer" target="_blank" rel="noreferrer" title="GitHub repository of ichitabi-timer">
            <ImGithub size="5vmin" color="white" />
          </a>
        </div>
      </header>
    </div>
  );
}

export default App;
