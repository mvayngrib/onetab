'use strict'

const thunky = require('thunky')
const KEY = '~~tabopentimestamp'

exports = module.exports = (function () {
  let timestamp
  let cb
  let isWinningTab
  window.addEventListener('storage', onUpdatedInAnotherTab, false)
  // // Improvements that didn't work:
  //
  // // Periodically write the new timestamp to storage
  // // on load, check if timestamp in storage is stale, and if so, declare self winner
  // // fails: when you open two new tabs at once
  // // after refreshMillis have gone by with no tabs open
  // // both will think they're the winner
  //
  // const refreshMillis = 5000
  // const refreshInterval = setInterval(update, refreshMillis)
  //
  // const lastVal = Number(localStorage.getItem(KEY)) || 0
  // if (lastVal < timestamp - refreshMillis * 2) {
  //   // assume other tab got closed
  //   isWinningTab = true
  // }

  // // remove KEY from storage on beforeunload
  // // on load, if KEY is not in storage, declare self winner
  // // fails: when two tabs are opened at the same time, both think they won
  // // when either is refreshed, it still thinks it won, because on beforeunload it removed KEY from localstorage
  // window.addEventListener('beforeunload', function () {
  //   try {
  //     localStorage.removeItem(KEY)
  //   } catch (err) {}
  // }, false)
  //
  // if (localStorage.getItem(KEY) == null) {
  //   // yoohoo!
  //   isWinningTab = true
  // }

  update()

  return thunky(function (_cb) {
    cb = _cb
    if (isWinningTab) return report()

    // if there isn't another tab open
    // there isn't a good way of knowing
    setTimeout(() => {
      isWinningTab = true
      report()
    }, exports.timeout)
  })

  function update () {
    timestamp = Date.now()
    try {
      localStorage.setItem(KEY, timestamp)
    } catch (err) {
      console.error('failed to set timestamp', err)
    }
  }

  function report () {
    if (cb) {
      // log('isTheirTab', isWinningTab, 'calling back')
      cb(null, isWinningTab)
      cb = null
    }
  }

  function onUpdatedInAnotherTab (e) {
    if (e.key !== KEY) return

    // should never be isNaN
    const val = e.newValue
    const theirTimestamp = isNaN(val) ? Infinity : Number(val)
    if (theirTimestamp < timestamp) {
      // they win
      // log('isTheirTab', 'they win', theirTimestamp, timestamp)
      isWinningTab = false
      // clearInterval(refreshInterval)
      window.removeEventListener('storage', onUpdatedInAnotherTab, false)
    } else {
      // tell other tab to die
      // log('isTheirTab', 'we win')
      localStorage.setItem(KEY, timestamp)
      isWinningTab = true
    }

    report()
  }
})()

exports.timeout = 100

function log () {
  return console.log.apply(console, arguments)
}
