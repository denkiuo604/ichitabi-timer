import { useEffect, useState } from 'react'
import { ImGithub, ImYoutube2 } from 'react-icons/im'
import { BsTwitterX } from 'react-icons/bs'
import './App.css'
import {
  days,
  pubWeeks,
  pubDays,
  pubHour,
  pubMinute,
  offMonths,
  tempSchedule
} from './config'

const App = () => {
  // 公開日が取得できなかった場合に返される週の値
  const WEEK_NOT_EXISTS = -1

  // 現在日時の取得
  const [today, setToday] = useState(new Date())

  // 公開日時設定用変数
  const pubHourOffset = pubHour - today.getTimezoneOffset() / 60 - 9 // UTC+9
  const [pubDate, initPubWeek] = getPubDateAndWeek(today)
  const [pubWeek, setPubWeek] = useState(initPubWeek)
  const [pubDay, setPubDay] = useState(pubDate.getDay())
  const [pubTime, setPubTime] = useState(getDateWithPubTime(pubDate))

  // カウントダウン用変数
  const dayMilliSec = 60 * 60 * 24 * 1000 // 1日=(60 * 60 * 24 * 1000)ミリ秒
  const hourMilliSec = 60 * 60 * 1000 // 1時間=(60 * 60 * 1000)ミリ秒
  const minMilliSec = 60 * 1000 // 1分=(60 * 1000)ミリ秒
  const timeDiff = getTimeDiff(today, pubTime)
  const [day, setDay] = useState(timeDiff.day)
  const [hour, setHour] = useState(timeDiff.hour)
  const [minute, setMinute] = useState(timeDiff.minute)
  const [second, setSecond] = useState(timeDiff.second)

  // カウントダウンの実行
  const countdown = () => {
    const today = new Date()
    setToday(today)
    const [pubDate, pubWeek] = getPubDateAndWeek(today)
    setPubWeek(pubWeek)
    setPubDay(pubDate.getDay())
    setPubTime(getDateWithPubTime(pubDate))

    if (pubTime.getTime() - today.getTime() >= 0) {
      const timeDiff = getTimeDiff(today, pubTime)
      setDay(timeDiff.day)
      setHour(timeDiff.hour)
      setMinute(timeDiff.minute)
      setSecond(timeDiff.second)
    }
  }
  useEffect(() => {
    const intervalId = setInterval(countdown, 1000)
    return () => {
      clearInterval(intervalId)
    }
  })

  /**
   * その年月のd曜日を取得する関数
   *
   * @param date - 調べたい年月の日付
   * @param day - 取得したい曜日を表す数値(0:日曜日〜6:土曜日)
   * @return ある年月のday曜日の日付の入った配列
   */
  function getDays (date: Date, day: number) {
    const year = date.getFullYear()
    const month = date.getMonth()

    const days = []

    for (let i = 1; i <= 31; i++) {
      const tmpDate = new Date(year, month, i)

      if (month !== tmpDate.getMonth()) break // 月代わりで処理終了
      if (tmpDate.getDay() !== day) continue // 引数に指定した曜日以外の時は何もしない
      days.push(tmpDate)
    }

    return days
  }

  /**
   * その年月の第n d曜日を取得する関数
   *
   * @param date - 調べたい年月の日付
   * @param week - 取得したい週
   * @param day - 取得したい曜日を表す数値(0:日曜日〜6:土曜日)
   * @returns ある年月の第week day曜日の日付
   */
  function getNthDay (date: Date, week: number, day: number) {
    const days = getDays(date, day)
    return days[week - 1]
  }

  /**
   * 与えられた日付の時分を公開時刻に変換する関数
   *
   * @param date - 日付
   * @returns 時分が公開時刻に変換された日時
   */
  function getDateWithPubTime (date: Date) {
    const result = new Date(date.getTime())
    result.setHours(pubHourOffset)
    result.setMinutes(pubMinute)
    result.setSeconds(0)
    return result
  }

  /**
   * 入力された日付を基に、次回公開日の日付と週を取得する関数
   *
   * @param date 日付
   * @returns 日付, 週
   */
  function getPubDateAndWeek (date: Date): [Date, number] {
    // 当月の公開日をすべて取得する
    // returnで必要なため、第何週かの情報も一緒に入れておく
    const pubDates: Array<[Date, number]> = []
    pubWeeks.forEach(week => {
      pubDays.forEach(day => {
        const nthDay = getNthDay(date, week, day)
        // 月によって第n d曜日が存在しない可能性もあるのでチェックする
        if (nthDay != null) {
          pubDates.push([getDateWithPubTime(nthDay), week])
        }
      })
    })

    // 当月の公開日のうち、入力日付以降のものを取得する
    const pubDatesAfterDate = pubDates.filter(pubDate => date < pubDate[0])

    // 当月の公開日のうち入力日付以降のものがなければ、来月の公開日を取得する
    if (pubDatesAfterDate.length === 0) {
      const dateNextMonth = new Date(date.getTime())
      dateNextMonth.setMonth(dateNextMonth.getMonth() + 1, 1)
      pubWeeks.forEach(week => {
        pubDays.forEach(day => {
          const nthDay = getNthDay(dateNextMonth, week, day)
          // 月によって第n d曜日が存在しない可能性もあるのでチェックする
          if (nthDay != null) {
            pubDatesAfterDate.push([getDateWithPubTime(nthDay), week])
          }
        })
      })
    }

    // 来月の公開日も存在しなかった場合は諦める
    if (pubDatesAfterDate.length === 0) {
      return [new Date(0), WEEK_NOT_EXISTS]
    }

    // 公開日のうち、最も直近のものを取得する
    const pubDate = pubDatesAfterDate.sort((a, b) => a[0].getTime() - b[0].getTime())[0]
    return [pubDate[0], pubDate[1]]
  }

  /**
   * 2つの日付の差分を返す関数
   *
   * @param date1 - 日付1
   * @param date2 - 日付2
   * @returns 日付の差分(date2-date1)を表すオブジェクト(day: 日数, hour: 時, minute: 分, second: 秒)
   */
  function getTimeDiff (date1: Date, date2: Date) {
    const timeDiff = date2.getTime() - date1.getTime()
    const day = Math.floor(timeDiff / dayMilliSec)
    const hour = Math.floor((timeDiff - day * dayMilliSec) / hourMilliSec)
    const minute = Math.floor((timeDiff - day * dayMilliSec - hour * hourMilliSec) / minMilliSec)
    const second = Math.floor((timeDiff - day * dayMilliSec - hour * hourMilliSec - minute * minMilliSec) / 1000)
    return { day, hour, minute, second }
  }

  /**
   * number型の値にゼロ埋めを施す関数
   * @param num ゼロ埋めしたい数値
   * @param maxLength ゼロ埋め後の桁数
   * @returns ゼロ埋めされた文字列
   */
  const zeroPadding = (num: number, maxLength: number) => {
    return num.toString().padStart(maxLength, '0')
  }

  return (
    <div className="App">
      <div>
        <p>今日は{today.getMonth() + 1}月{today.getDate()}日({days[today.getDay()]})</p>
        <p>「志国一路のイチ旅！」</p>
      </div>
      <div className="youtube-wrap">
        <div className="youtube">
          <iframe src="https://www.youtube-nocookie.com/embed/videoseries?list=PL7cOHyUohYjaVo7_3JdkOaPB57Y_GuTOJ" title="YouTube video player" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
        </div>
      </div>
      <div hidden={offMonths.includes(pubTime.getMonth() + 1) || tempSchedule || pubWeek === WEEK_NOT_EXISTS}>
        <p>次回作公開（{pubTime.getMonth() + 1}月第{pubWeek}{days[pubDay]}曜日{zeroPadding(pubHourOffset, 2)}:{zeroPadding(pubMinute, 2)}）まで</p>
        <p>あと{day}日{hour}時間{zeroPadding(minute, 2)}分{zeroPadding(second, 2)}秒</p>
      </div>
      <div hidden={!offMonths.includes(pubTime.getMonth() + 1) || tempSchedule}>
        <p>{pubTime.getMonth() + 1}月はお休みです。<br />これまでの「イチ旅！」や配信、アーカイブを楽しみましょう！</p>
      </div>
      <div hidden={!tempSchedule && pubWeek !== WEEK_NOT_EXISTS}>
        <p>次回作公開まで、あと少し。</p>
        <a className="description" href="https://twitter.com/shikuni_ichiro" target="_blank" rel="noopener noreferrer" title="志国一路さんのTwitter(現X)">
          <p>志国一路さんのTwitter(現X)</p>
          <BsTwitterX size="5vmin" />
        </a>
      </div>
      <div>
        <a className="description" href="https://www.youtube.com/c/ShikuniIchiro" target="_blank" rel="noopener noreferrer" title="志国一路さんのYouTubeチャンネル">
          <p>志国一路さんのYouTubeチャンネル</p>
          <ImYoutube2 size="12vmin" />
        </a>
        <p className="about">Ichitabi Timer</p>
        <div className="about">
          <a href="https://github.com/denkiuo604/ichitabi-timer" target="_blank" rel="noopener noreferrer" title="GitHub repository of Ichitabi Timer">
            <ImGithub size="5vmin" />
          </a>
          <a href="https://twitter.com/intent/tweet?text=Ichitabi%20Timer&url=https%3A%2F%2Fdenkiuo604.github.io%2Fichitabi-timer" target="_blank" rel="noopener noreferrer" title="Tweet about Ichitabi Timer">
            <BsTwitterX size="5vmin" />
          </a>
        </div>
      </div>
    </div>
  )
}

export default App
