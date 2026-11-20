(function () {
  "use strict";

  try {
    if (window.__gcmOfflineStarted) return;
    window.__gcmOfflineStarted = true;

    var registrations = [];
    var readyCount = 0;
    var finished = false;
    var scripts = [
      { url: "sw.js", scope: "./" },
      { url: "../goto-citymall-demo/sw.js", scope: "../goto-citymall-demo/" },
      { url: "../goto-citymall-post/sw.js", scope: "../goto-citymall-post/" },
    ];

    function debug(value) {
      try {
        if (window.console && typeof window.console.debug === "function") {
          window.console.debug("[offline]", value);
        }
      } catch (_) {}
    }

    function show(state, text) {
      try {
        var element = document.getElementById("offlineState");
        if (!element) return;
        element.setAttribute("data-s", state);
        element.textContent = text;
      } catch (_) {}
    }

    function showWaiting() {
      show("wait", "電波なしで開く準備をしています…（" + readyCount + "/3）");
    }

    function showUnsupported() {
      finished = true;
      show("no", "このブラウザでは電波なしで開けません。Safari か Chrome で開いてください");
    }

    function showFailure() {
      finished = true;
      show("ng", "電波なしの準備ができていません。電波のある所で、このページを開き直してください");
    }

    function formatJapanTime(iso) {
      var date = new Date(new Date(iso).getTime() + 9 * 60 * 60 * 1000);
      function two(value) {
        return value < 10 ? "0" + value : String(value);
      }
      return (date.getUTCMonth() + 1) + "/" + date.getUTCDate() + " " +
        two(date.getUTCHours()) + ":" + two(date.getUTCMinutes());
    }

    function looksLikeAppBrowser() {
      try {
        var ua = navigator.userAgent || "";
        return /(Line\/|FBAN|FBAV|Instagram|MicroMessenger|; wv\))/i.test(ua);
      } catch (_) {
        return false;
      }
    }

    function isUnsupportedError(error) {
      var name = error && error.name ? error.name : "";
      return name === "SecurityError" || name === "NotSupportedError" ||
        name === "InvalidStateError" || name === "QuotaExceededError";
    }

    function checkWorker(worker) {
      return new Promise(function (resolve, reject) {
        var settled = false;
        var channel;
        var timer;

        function closePorts() {
          try {
            if (channel.port1 && channel.port1.close) channel.port1.close();
            if (channel.port2 && channel.port2.close) channel.port2.close();
          } catch (_) {}
        }

        function fail(error) {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          closePorts();
          reject(error);
        }

        try {
          channel = new MessageChannel();
          timer = setTimeout(function () {
            fail(new Error("Service Worker の確認が時間切れになりました"));
          }, 12000);
          channel.port1.onmessage = function (event) {
            try {
              if (settled) return;
              settled = true;
              clearTimeout(timer);
              var data = event.data || {};
              closePorts();
              if (data.ok && data.have === data.total && data.at) {
                resolve(data);
              } else {
                reject(new Error("保存件数が足りません"));
              }
            } catch (error) {
              fail(error);
            }
          };
          worker.postMessage({ type: "check" }, [channel.port2]);
        } catch (error) {
          fail(error);
        }
      });
    }

    function waitForActive(registration) {
      return new Promise(function (resolve, reject) {
        var settled = false;
        var watched = [];
        var interval;

        function finish(worker) {
          if (settled) return;
          settled = true;
          clearInterval(interval);
          resolve(worker);
        }

        function fail(error) {
          if (settled) return;
          settled = true;
          clearInterval(interval);
          reject(error);
        }

        function watch(worker) {
          if (!worker || watched.indexOf(worker) !== -1) return;
          watched.push(worker);
          try {
            if (worker.state === "redundant") {
              fail(new Error("Service Worker のインストールに失敗しました"));
              return;
            }
            if (worker.state === "activated") {
              finish(worker);
              return;
            }
            worker.addEventListener("statechange", function () {
              try {
                if (worker.state === "redundant") {
                  fail(new Error("Service Worker のインストールに失敗しました"));
                } else {
                  inspect();
                }
              } catch (error) {
                fail(error);
              }
            });
          } catch (error) {
            fail(error);
          }
        }

        function inspect() {
          try {
            // 更新中の Worker があれば、古い active より新しい方の完了を待つ。
            var candidate = registration.installing || registration.waiting || registration.active;
            watch(candidate);
            if (candidate && candidate.state === "redundant") {
              fail(new Error("Service Worker のインストールに失敗しました"));
            } else if (candidate && candidate.state === "activated") {
              finish(candidate);
            }
          } catch (error) {
            fail(error);
          }
        }

        try {
          registration.addEventListener("updatefound", inspect);
          interval = setInterval(inspect, 250);
          inspect();
        } catch (error) {
          fail(error);
        }
      });
    }

    function registerOne(item) {
      return navigator.serviceWorker.register(item.url, { scope: item.scope }).then(function (registration) {
        registrations.push(registration);
        return waitForActive(registration);
      }).then(function (worker) {
        return checkWorker(worker);
      }).then(function (result) {
        readyCount += 1;
        if (!finished) showWaiting();
        return result;
      });
    }

    function updateRegistrations() {
      for (var i = 0; i < registrations.length; i += 1) {
        try {
          var updateResult = registrations[i].update();
          if (updateResult && typeof updateResult.catch === "function") {
            updateResult.catch(debug);
          }
        } catch (error) {
          debug(error);
        }
      }
    }

    if (!window.isSecureContext || !("serviceWorker" in navigator) ||
        typeof MessageChannel === "undefined" || looksLikeAppBrowser()) {
      showUnsupported();
      return;
    }

    showWaiting();
    window.addEventListener("online", updateRegistrations);

    var timeoutId;
    var timeout = new Promise(function (_, reject) {
      timeoutId = setTimeout(function () {
        reject(new Error("3つの保存が3分以内に完了しませんでした"));
      }, 180000);
    });

    Promise.race([
      Promise.all(scripts.map(registerOne)),
      timeout,
    ]).then(function (results) {
      if (finished) return;
      clearTimeout(timeoutId);
      finished = true;
      var oldest = results[0].at;
      for (var i = 1; i < results.length; i += 1) {
        if (new Date(results[i].at).getTime() < new Date(oldest).getTime()) {
          oldest = results[i].at;
        }
      }
      show("ok", "✓ 電波なしでも開けます（保存 " + formatJapanTime(oldest) + "）");
    }).catch(function (error) {
      clearTimeout(timeoutId);
      debug(error);
      if (isUnsupportedError(error)) showUnsupported();
      else showFailure();
    });
  } catch (error) {
    try {
      var unsupported = !window.isSecureContext || !("serviceWorker" in navigator);
      var fallbackElement = document.getElementById("offlineState");
      if (fallbackElement) {
        fallbackElement.setAttribute("data-s", unsupported ? "no" : "ng");
        fallbackElement.textContent = unsupported
          ? "このブラウザでは電波なしで開けません。Safari か Chrome で開いてください"
          : "電波なしの準備ができていません。電波のある所で、このページを開き直してください";
      }
    } catch (_) {}
  }
})();
