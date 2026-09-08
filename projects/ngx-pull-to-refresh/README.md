# ngx-pull-to-refresh

An Angular pull-to-refresh component, similar to Android's
[SwipeRefreshLayout](https://developer.android.com/jetpack/androidx/releases/swiperefreshlayout).
It also emits a `loadMore` event when the user scrolls near the end of the content,
so the same component covers pull-to-refresh and infinite scrolling.

## Installation

```bash
npm install ngx-pull-to-refresh
```

## Compatibility

| ngx-pull-to-refresh | Angular   |
|---------------------|-----------|
| 22.x                | >= 21     |
| 20.x                | 20 – 21   |
| 19.x                | 19        |
| 18.x                | ^18.1     |

## Usage

`NgxPullToRefreshComponent` is a standalone component, so add it to the `imports`
of whichever component uses it.

```typescript
import { Component, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { NgxPullToRefreshComponent } from 'ngx-pull-to-refresh';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
  imports: [NgxPullToRefreshComponent],
})
export class AppComponent implements OnInit {
  targetElement?: Element | null;

  ngOnInit(): void {
    this.targetElement = document.querySelector('html');
  }

  myRefreshEvent(event: Subject<void>, message: string): void {
    setTimeout(() => {
      alert(message);
      event.next(); // tell the component the refresh is done
    }, 3000);
  }

  alert(message: string): void {
    alert(message);
  }
}
```

```html
<ngx-pull-to-refresh
  spinnerColor="#ff0000"
  spinnerSize="50"
  distanceForRefresh="40"
  [isEnable]="true"
  [targetElement]="targetElement"
  (refresh)="myRefreshEvent($event, 'refresh')"
  (loadMore)="alert('loadmore')"
  style="display:block;height:100%;"
>
  <div style="height: 3000px">long content</div>
</ngx-pull-to-refresh>
```

The `refresh` output emits a `Subject`. The spinner keeps animating until you call
`next()` on it, so call it once your data has finished loading.

## Inputs

| Name                 | Type      | Default   | Description                                                                                             |
|----------------------|-----------|-----------|---------------------------------------------------------------------------------------------------------|
| `spinnerColor`       | `string`  | `#F7C223` | Refresh spinner color.                                                                                  |
| `spinnerSize`        | `number`  | `300`     | Refresh spinner size.                                                                                   |
| `distanceForRefresh` | `number`  | `40`      | Pull distance that triggers the `refresh` event.                                                        |
| `isEnable`           | `boolean` | `true`    | Enables or disables pull-to-refresh handling.                                                           |
| `isHorizontal`       | `boolean` | `false`   | Set to `true` for horizontally scrolling content. Pull-to-refresh is disabled, `loadMore` still fires.  |
| `customClass`        | `string`  | `''`      | CSS class applied to the inner `.ngx-ptr-content-container` element.                                    |
| `targetElement`      | `Element` | itself    | Normally not needed. Pass the scrolling element (e.g. `document.querySelector('html')`) if events do not fire. |

## Outputs

| Name       | Payload   | Description                                                                                       |
|------------|-----------|-----------------------------------------------------------------------------------------------------|
| `refresh`  | `Subject` | Fires when the pull distance exceeds `distanceForRefresh`. Call `next()` on the payload when done. |
| `loadMore` | `true`    | Fires when the content is scrolled past 85% of its scrollable length.                              |

## License

The MIT License (MIT)

Copyright (c) 2019 YeongCheon Kim

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
