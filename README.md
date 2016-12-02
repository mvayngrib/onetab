# onetab

Sometimes you don't want your web app running in multiple tabs at once, e.g. because multi-tab storage management (particularly with indexedDB) becomes a pain in your ass.

To avoid ass pain, detect if your web app is open in another tab, and act accordingly

## Usage

```js
const isFirstTab = require('onetab')
// declare self winner if no other tab contests during timeout
isFirstTab.timeout = 100 // default value
isFirstTab(function (err, result) {
  if (result) {
    startMyApp()
  } else {
    alert('This page can only be open in one tab. Please close either this or the other tab.')
  }
})
```

## How it works

localStorage emits a "storage" event when it is written to in another tab. This module initiates a battle of timestamps between tabs by writing to localStorage, to see who came first.

The weakness of the implementation is when the application is only open in one tab, it has to wait for a timeout before declaring itself a winner.

## TODO

Detect when the situation changes and the nth tab becomes the only one, to avoid forcing the user to refresh tab number 2 if they choose to close tab number 1.
