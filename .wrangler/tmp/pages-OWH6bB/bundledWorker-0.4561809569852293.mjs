var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// ../../../node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// ../../../node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// ../../../node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// ../../../node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// ../../../node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// ../../../node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x2, y2, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// ../../../node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// ../../../node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// ../../../node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// ../../../node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// _worker.js/index.js
import("node:buffer").then(({ Buffer: Buffer2 }) => {
  globalThis.Buffer = Buffer2;
}).catch(() => null);
var __ALSes_PROMISE__ = import("node:async_hooks").then(({ AsyncLocalStorage }) => {
  globalThis.AsyncLocalStorage = AsyncLocalStorage;
  const envAsyncLocalStorage = new AsyncLocalStorage();
  const requestContextAsyncLocalStorage = new AsyncLocalStorage();
  globalThis.process = {
    env: new Proxy(
      {},
      {
        ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(envAsyncLocalStorage.getStore()), "ownKeys"),
        getOwnPropertyDescriptor: /* @__PURE__ */ __name((_2, ...args) => Reflect.getOwnPropertyDescriptor(envAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
        get: /* @__PURE__ */ __name((_2, property) => Reflect.get(envAsyncLocalStorage.getStore(), property), "get"),
        set: /* @__PURE__ */ __name((_2, property, value) => Reflect.set(envAsyncLocalStorage.getStore(), property, value), "set")
      }
    )
  };
  globalThis[/* @__PURE__ */ Symbol.for("__cloudflare-request-context__")] = new Proxy(
    {},
    {
      ownKeys: /* @__PURE__ */ __name(() => Reflect.ownKeys(requestContextAsyncLocalStorage.getStore()), "ownKeys"),
      getOwnPropertyDescriptor: /* @__PURE__ */ __name((_2, ...args) => Reflect.getOwnPropertyDescriptor(requestContextAsyncLocalStorage.getStore(), ...args), "getOwnPropertyDescriptor"),
      get: /* @__PURE__ */ __name((_2, property) => Reflect.get(requestContextAsyncLocalStorage.getStore(), property), "get"),
      set: /* @__PURE__ */ __name((_2, property, value) => Reflect.set(requestContextAsyncLocalStorage.getStore(), property, value), "set")
    }
  );
  return { envAsyncLocalStorage, requestContextAsyncLocalStorage };
}).catch(() => null);
var st = Object.create;
var N = Object.defineProperty;
var it = Object.getOwnPropertyDescriptor;
var at = Object.getOwnPropertyNames;
var rt = Object.getPrototypeOf;
var ot = Object.prototype.hasOwnProperty;
var T = /* @__PURE__ */ __name((t, e) => () => (t && (e = t(t = 0)), e), "T");
var V = /* @__PURE__ */ __name((t, e) => () => (e || t((e = { exports: {} }).exports, e), e.exports), "V");
var ct = /* @__PURE__ */ __name((t, e, s, n) => {
  if (e && typeof e == "object" || typeof e == "function") for (let a of at(e)) !ot.call(t, a) && a !== s && N(t, a, { get: /* @__PURE__ */ __name(() => e[a], "get"), enumerable: !(n = it(e, a)) || n.enumerable });
  return t;
}, "ct");
var $ = /* @__PURE__ */ __name((t, e, s) => (s = t != null ? st(rt(t)) : {}, ct(e || !t || !t.__esModule ? N(s, "default", { value: t, enumerable: true }) : s, t)), "$");
var g;
var u = T(() => {
  g = { collectedLocales: [] };
});
var h;
var p = T(() => {
  h = { version: 3, routes: { none: [{ src: "^(?:/((?:[^/]+?)(?:/(?:[^/]+?))*))/$", headers: { Location: "/$1" }, status: 308, continue: true }, { src: "^/_next/__private/trace$", dest: "/404", status: 404, continue: true }, { src: "^/404/?$", status: 404, continue: true, missing: [{ type: "header", key: "x-prerender-revalidate" }] }, { src: "^/500$", status: 500, continue: true }, { src: "^/?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/index.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }, { src: "^/((?!.+\\.rsc).+?)(?:/)?$", has: [{ type: "header", key: "rsc", value: "1" }], dest: "/$1.rsc", headers: { vary: "RSC, Next-Router-State-Tree, Next-Router-Prefetch" }, continue: true, override: true }], filesystem: [{ src: "^/index(\\.action|\\.rsc)$", dest: "/", continue: true }, { src: "^/_next/data/(.*)$", dest: "/_next/data/$1", check: true }, { src: "^/\\.prefetch\\.rsc$", dest: "/__index.prefetch.rsc", check: true }, { src: "^/(.+)/\\.prefetch\\.rsc$", dest: "/$1.prefetch.rsc", check: true }, { src: "^/\\.rsc$", dest: "/index.rsc", check: true }, { src: "^/(.+)/\\.rsc$", dest: "/$1.rsc", check: true }], miss: [{ src: "^/_next/static/.+$", status: 404, check: true, dest: "/_next/static/not-found.txt", headers: { "content-type": "text/plain; charset=utf-8" } }], rewrite: [{ src: "^/_next/data/(.*)$", dest: "/404", status: 404 }, { src: "^/api/admin/banners/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/admin/banners/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/admin/banners/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/admin/banners/[id]?nxtPid=$nxtPid" }, { src: "^/api/admin/categories/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/admin/categories/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/admin/categories/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/admin/categories/[id]?nxtPid=$nxtPid" }, { src: "^/api/admin/orders/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/admin/orders/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/admin/orders/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/admin/orders/[id]?nxtPid=$nxtPid" }, { src: "^/api/admin/products/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/admin/products/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/admin/products/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/admin/products/[id]?nxtPid=$nxtPid" }, { src: "^/api/admin/promotions/(?<nxtPid>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/api/admin/promotions/[id].rsc?nxtPid=$nxtPid" }, { src: "^/api/admin/promotions/(?<nxtPid>[^/]+?)(?:/)?$", dest: "/api/admin/promotions/[id]?nxtPid=$nxtPid" }, { src: "^/products/(?<nxtPslug>[^/]+?)(?:\\.rsc)(?:/)?$", dest: "/products/[slug].rsc?nxtPslug=$nxtPslug" }, { src: "^/products/(?<nxtPslug>[^/]+?)(?:/)?$", dest: "/products/[slug]?nxtPslug=$nxtPslug" }], resource: [{ src: "^/.*$", status: 404 }], hit: [{ src: "^/_next/static/(?:[^/]+/pages|pages|chunks|runtime|css|image|media|xenUvd7THETrcvghkCqEP)/.+$", headers: { "cache-control": "public,max-age=31536000,immutable" }, continue: true, important: true }, { src: "^/index(?:/)?$", headers: { "x-matched-path": "/" }, continue: true, important: true }, { src: "^/((?!index$).*?)(?:/)?$", headers: { "x-matched-path": "/$1" }, continue: true, important: true }], error: [{ src: "^/.*$", dest: "/_not-found", status: 404, headers: { "x-next-error-status": "404" } }, { src: "^/.*$", dest: "/500", status: 500, headers: { "x-next-error-status": "500" } }] }, overrides: { "500.html": { path: "500", contentType: "text/html; charset=utf-8" }, "_app.rsc.json": { path: "_app.rsc", contentType: "application/json" }, "_error.rsc.json": { path: "_error.rsc", contentType: "application/json" }, "_document.rsc.json": { path: "_document.rsc", contentType: "application/json" }, "_next/static/not-found.txt": { contentType: "text/plain" } }, framework: { slug: "nextjs", version: "14.2.18" }, crons: [] };
});
var _;
var d = T(() => {
  _ = { "/500.html": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc.json": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc.json": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc.json": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_next/static/chunks/30-70fd07b6aea1abf4.js": { type: "static" }, "/_next/static/chunks/340-543e4c049e587c1e.js": { type: "static" }, "/_next/static/chunks/371-b35aaf466163e740.js": { type: "static" }, "/_next/static/chunks/972-e0022b442a6a7d0f.js": { type: "static" }, "/_next/static/chunks/app/_not-found/page-ed1c9672e761abc8.js": { type: "static" }, "/_next/static/chunks/app/about/page-2e9a356ed85f04ad.js": { type: "static" }, "/_next/static/chunks/app/account/orders/page-b1288ec79ac823d7.js": { type: "static" }, "/_next/static/chunks/app/account/page-ab6c8ba3fec2dfa3.js": { type: "static" }, "/_next/static/chunks/app/admin/banners/page-3c406882faf222d1.js": { type: "static" }, "/_next/static/chunks/app/admin/categories/page-3729132b8628d096.js": { type: "static" }, "/_next/static/chunks/app/admin/contents/page-57766871ff10645d.js": { type: "static" }, "/_next/static/chunks/app/admin/customers/page-f4e4140398a06f73.js": { type: "static" }, "/_next/static/chunks/app/admin/layout-9e14be43f89a31a3.js": { type: "static" }, "/_next/static/chunks/app/admin/orders/page-4d50b36acac11c68.js": { type: "static" }, "/_next/static/chunks/app/admin/page-caf4744260ba83bb.js": { type: "static" }, "/_next/static/chunks/app/admin/products/page-51535e53805fd248.js": { type: "static" }, "/_next/static/chunks/app/admin/promotions/page-a8b353f337f1c152.js": { type: "static" }, "/_next/static/chunks/app/admin/settings/page-2cc0ddccac99147d.js": { type: "static" }, "/_next/static/chunks/app/cart/page-0cc9ba662d831d0d.js": { type: "static" }, "/_next/static/chunks/app/checkout/page-4d3dcc43919e0cd1.js": { type: "static" }, "/_next/static/chunks/app/checkout/success/page-af53ccda05059203.js": { type: "static" }, "/_next/static/chunks/app/contact/page-e6550700a04ad9a9.js": { type: "static" }, "/_next/static/chunks/app/howto/page-1d73125c956062da.js": { type: "static" }, "/_next/static/chunks/app/layout-d844e888bdfacedc.js": { type: "static" }, "/_next/static/chunks/app/login/page-73bca1749c4056e5.js": { type: "static" }, "/_next/static/chunks/app/not-found-2504856457911a1a.js": { type: "static" }, "/_next/static/chunks/app/page-142dd6c00aa33c75.js": { type: "static" }, "/_next/static/chunks/app/policy/page-397afbc919c78ca2.js": { type: "static" }, "/_next/static/chunks/app/products/[slug]/page-7a1ab1d0bebbda12.js": { type: "static" }, "/_next/static/chunks/app/products/page-c04dc15b1bb3963f.js": { type: "static" }, "/_next/static/chunks/app/register/page-e9fbb9df2ff5f350.js": { type: "static" }, "/_next/static/chunks/ee560e2c-4074e882d7e0975b.js": { type: "static" }, "/_next/static/chunks/fd9d1056-49ca28257eb7a92c.js": { type: "static" }, "/_next/static/chunks/framework-f66176bb897dc684.js": { type: "static" }, "/_next/static/chunks/main-23312e075c70dc97.js": { type: "static" }, "/_next/static/chunks/main-app-5f8e984882cc709b.js": { type: "static" }, "/_next/static/chunks/pages/_app-72b849fbd24ac258.js": { type: "static" }, "/_next/static/chunks/pages/_error-7ba65e1336b92748.js": { type: "static" }, "/_next/static/chunks/polyfills-42372ed130431b0a.js": { type: "static" }, "/_next/static/chunks/webpack-a3c37fcbf859f6f9.js": { type: "static" }, "/_next/static/css/eeb842392c82dbab.css": { type: "static" }, "/_next/static/not-found.txt": { type: "static" }, "/_next/static/xenUvd7THETrcvghkCqEP/_buildManifest.js": { type: "static" }, "/_next/static/xenUvd7THETrcvghkCqEP/_ssgManifest.js": { type: "static" }, "/_not-found": { type: "function", entrypoint: "__next-on-pages-dist__/functions/_not-found.func.js" }, "/_not-found.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/_not-found.func.js" }, "/about": { type: "function", entrypoint: "__next-on-pages-dist__/functions/about.func.js" }, "/about.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/about.func.js" }, "/account/orders": { type: "function", entrypoint: "__next-on-pages-dist__/functions/account/orders.func.js" }, "/account/orders.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/account/orders.func.js" }, "/account": { type: "function", entrypoint: "__next-on-pages-dist__/functions/account.func.js" }, "/account.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/account.func.js" }, "/admin/banners": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/banners.func.js" }, "/admin/banners.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/banners.func.js" }, "/admin/categories": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/categories.func.js" }, "/admin/categories.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/categories.func.js" }, "/admin/contents": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/contents.func.js" }, "/admin/contents.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/contents.func.js" }, "/admin/customers": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/customers.func.js" }, "/admin/customers.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/customers.func.js" }, "/admin/orders": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/orders.func.js" }, "/admin/orders.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/orders.func.js" }, "/admin/products": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/products.func.js" }, "/admin/products.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/products.func.js" }, "/admin/promotions": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/promotions.func.js" }, "/admin/promotions.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/promotions.func.js" }, "/admin/settings": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/settings.func.js" }, "/admin/settings.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin/settings.func.js" }, "/admin": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin.func.js" }, "/admin.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/admin.func.js" }, "/api/admin/banners/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/banners/[id].func.js" }, "/api/admin/banners/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/banners/[id].func.js" }, "/api/admin/banners": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/banners.func.js" }, "/api/admin/banners.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/banners.func.js" }, "/api/admin/categories/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/categories/[id].func.js" }, "/api/admin/categories/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/categories/[id].func.js" }, "/api/admin/categories": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/categories.func.js" }, "/api/admin/categories.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/categories.func.js" }, "/api/admin/contents": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/contents.func.js" }, "/api/admin/contents.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/contents.func.js" }, "/api/admin/orders/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/orders/[id].func.js" }, "/api/admin/orders/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/orders/[id].func.js" }, "/api/admin/orders": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/orders.func.js" }, "/api/admin/orders.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/orders.func.js" }, "/api/admin/products/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/products/[id].func.js" }, "/api/admin/products/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/products/[id].func.js" }, "/api/admin/products": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/products.func.js" }, "/api/admin/products.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/products.func.js" }, "/api/admin/promotions/[id]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/promotions/[id].func.js" }, "/api/admin/promotions/[id].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/promotions/[id].func.js" }, "/api/admin/promotions": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/promotions.func.js" }, "/api/admin/promotions.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/promotions.func.js" }, "/api/admin/settings": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/settings.func.js" }, "/api/admin/settings.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/settings.func.js" }, "/api/admin/users": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/users.func.js" }, "/api/admin/users.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/admin/users.func.js" }, "/api/auth/login": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/login.func.js" }, "/api/auth/login.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/login.func.js" }, "/api/auth/logout": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/logout.func.js" }, "/api/auth/logout.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/logout.func.js" }, "/api/auth/me": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/me.func.js" }, "/api/auth/me.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/me.func.js" }, "/api/auth/register": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/register.func.js" }, "/api/auth/register.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/auth/register.func.js" }, "/api/contact": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/contact.func.js" }, "/api/contact.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/contact.func.js" }, "/api/orders": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/orders.func.js" }, "/api/orders.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/orders.func.js" }, "/api/settings": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/settings.func.js" }, "/api/settings.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/api/settings.func.js" }, "/cart": { type: "function", entrypoint: "__next-on-pages-dist__/functions/cart.func.js" }, "/cart.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/cart.func.js" }, "/checkout/success": { type: "function", entrypoint: "__next-on-pages-dist__/functions/checkout/success.func.js" }, "/checkout/success.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/checkout/success.func.js" }, "/checkout": { type: "function", entrypoint: "__next-on-pages-dist__/functions/checkout.func.js" }, "/checkout.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/checkout.func.js" }, "/contact": { type: "function", entrypoint: "__next-on-pages-dist__/functions/contact.func.js" }, "/contact.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/contact.func.js" }, "/howto": { type: "function", entrypoint: "__next-on-pages-dist__/functions/howto.func.js" }, "/howto.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/howto.func.js" }, "/index": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/index.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/index.func.js" }, "/login": { type: "function", entrypoint: "__next-on-pages-dist__/functions/login.func.js" }, "/login.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/login.func.js" }, "/policy": { type: "function", entrypoint: "__next-on-pages-dist__/functions/policy.func.js" }, "/policy.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/policy.func.js" }, "/products/[slug]": { type: "function", entrypoint: "__next-on-pages-dist__/functions/products/[slug].func.js" }, "/products/[slug].rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/products/[slug].func.js" }, "/products": { type: "function", entrypoint: "__next-on-pages-dist__/functions/products.func.js" }, "/products.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/products.func.js" }, "/register": { type: "function", entrypoint: "__next-on-pages-dist__/functions/register.func.js" }, "/register.rsc": { type: "function", entrypoint: "__next-on-pages-dist__/functions/register.func.js" }, "/500": { type: "override", path: "/500.html", headers: { "content-type": "text/html; charset=utf-8" } }, "/_app.rsc": { type: "override", path: "/_app.rsc.json", headers: { "content-type": "application/json" } }, "/_error.rsc": { type: "override", path: "/_error.rsc.json", headers: { "content-type": "application/json" } }, "/_document.rsc": { type: "override", path: "/_document.rsc.json", headers: { "content-type": "application/json" } } };
});
var F = V((zt, q) => {
  "use strict";
  u();
  p();
  d();
  function w(t, e) {
    t = String(t || "").trim();
    let s = t, n, a = "";
    if (/^[^a-zA-Z\\\s]/.test(t)) {
      n = t[0];
      let o = t.lastIndexOf(n);
      a += t.substring(o + 1), t = t.substring(1, o);
    }
    let i = 0;
    return t = dt(t, (o) => {
      if (/^\(\?[P<']/.test(o)) {
        let c = /^\(\?P?[<']([^>']+)[>']/.exec(o);
        if (!c) throw new Error(`Failed to extract named captures from ${JSON.stringify(o)}`);
        let l = o.substring(c[0].length, o.length - 1);
        return e && (e[i] = c[1]), i++, `(${l})`;
      }
      return o.substring(0, 3) === "(?:" || i++, o;
    }), t = t.replace(/\[:([^:]+):\]/g, (o, c) => w.characterClasses[c] || o), new w.PCRE(t, a, s, a, n);
  }
  __name(w, "w");
  function dt(t, e) {
    let s = 0, n = 0, a = false;
    for (let r = 0; r < t.length; r++) {
      let i = t[r];
      if (a) {
        a = false;
        continue;
      }
      switch (i) {
        case "(":
          n === 0 && (s = r), n++;
          break;
        case ")":
          if (n > 0 && (n--, n === 0)) {
            let o = r + 1, c = s === 0 ? "" : t.substring(0, s), l = t.substring(o), f = String(e(t.substring(s, o)));
            t = c + f + l, r = s;
          }
          break;
        case "\\":
          a = true;
          break;
        default:
          break;
      }
    }
    return t;
  }
  __name(dt, "dt");
  (function(t) {
    class e extends RegExp {
      static {
        __name(this, "e");
      }
      constructor(n, a, r, i, o) {
        super(n, a), this.pcrePattern = r, this.pcreFlags = i, this.delimiter = o;
      }
    }
    t.PCRE = e, t.characterClasses = { alnum: "[A-Za-z0-9]", word: "[A-Za-z0-9_]", alpha: "[A-Za-z]", blank: "[ \\t]", cntrl: "[\\x00-\\x1F\\x7F]", digit: "\\d", graph: "[\\x21-\\x7E]", lower: "[a-z]", print: "[\\x20-\\x7E]", punct: "[\\]\\[!\"#$%&'()*+,./:;<=>?@\\\\^_`{|}~-]", space: "\\s", upper: "[A-Z]", xdigit: "[A-Fa-f0-9]" };
  })(w || (w = {}));
  w.prototype = w.PCRE.prototype;
  q.exports = w;
});
var Q = V((U) => {
  "use strict";
  u();
  p();
  d();
  U.parse = Pt;
  U.serialize = jt;
  var bt = Object.prototype.toString, E = /^[\u0009\u0020-\u007e\u0080-\u00ff]+$/;
  function Pt(t, e) {
    if (typeof t != "string") throw new TypeError("argument str must be a string");
    for (var s = {}, n = e || {}, a = n.decode || vt, r = 0; r < t.length; ) {
      var i = t.indexOf("=", r);
      if (i === -1) break;
      var o = t.indexOf(";", r);
      if (o === -1) o = t.length;
      else if (o < i) {
        r = t.lastIndexOf(";", i - 1) + 1;
        continue;
      }
      var c = t.slice(r, i).trim();
      if (s[c] === void 0) {
        var l = t.slice(i + 1, o).trim();
        l.charCodeAt(0) === 34 && (l = l.slice(1, -1)), s[c] = Ct(l, a);
      }
      r = o + 1;
    }
    return s;
  }
  __name(Pt, "Pt");
  function jt(t, e, s) {
    var n = s || {}, a = n.encode || kt;
    if (typeof a != "function") throw new TypeError("option encode is invalid");
    if (!E.test(t)) throw new TypeError("argument name is invalid");
    var r = a(e);
    if (r && !E.test(r)) throw new TypeError("argument val is invalid");
    var i = t + "=" + r;
    if (n.maxAge != null) {
      var o = n.maxAge - 0;
      if (isNaN(o) || !isFinite(o)) throw new TypeError("option maxAge is invalid");
      i += "; Max-Age=" + Math.floor(o);
    }
    if (n.domain) {
      if (!E.test(n.domain)) throw new TypeError("option domain is invalid");
      i += "; Domain=" + n.domain;
    }
    if (n.path) {
      if (!E.test(n.path)) throw new TypeError("option path is invalid");
      i += "; Path=" + n.path;
    }
    if (n.expires) {
      var c = n.expires;
      if (!St(c) || isNaN(c.valueOf())) throw new TypeError("option expires is invalid");
      i += "; Expires=" + c.toUTCString();
    }
    if (n.httpOnly && (i += "; HttpOnly"), n.secure && (i += "; Secure"), n.priority) {
      var l = typeof n.priority == "string" ? n.priority.toLowerCase() : n.priority;
      switch (l) {
        case "low":
          i += "; Priority=Low";
          break;
        case "medium":
          i += "; Priority=Medium";
          break;
        case "high":
          i += "; Priority=High";
          break;
        default:
          throw new TypeError("option priority is invalid");
      }
    }
    if (n.sameSite) {
      var f = typeof n.sameSite == "string" ? n.sameSite.toLowerCase() : n.sameSite;
      switch (f) {
        case true:
          i += "; SameSite=Strict";
          break;
        case "lax":
          i += "; SameSite=Lax";
          break;
        case "strict":
          i += "; SameSite=Strict";
          break;
        case "none":
          i += "; SameSite=None";
          break;
        default:
          throw new TypeError("option sameSite is invalid");
      }
    }
    return i;
  }
  __name(jt, "jt");
  function vt(t) {
    return t.indexOf("%") !== -1 ? decodeURIComponent(t) : t;
  }
  __name(vt, "vt");
  function kt(t) {
    return encodeURIComponent(t);
  }
  __name(kt, "kt");
  function St(t) {
    return bt.call(t) === "[object Date]" || t instanceof Date;
  }
  __name(St, "St");
  function Ct(t, e) {
    try {
      return e(t);
    } catch {
      return t;
    }
  }
  __name(Ct, "Ct");
});
u();
p();
d();
u();
p();
d();
u();
p();
d();
var b = "INTERNAL_SUSPENSE_CACHE_HOSTNAME.local";
u();
p();
d();
u();
p();
d();
u();
p();
d();
u();
p();
d();
var D = $(F());
function k(t, e, s) {
  if (e == null) return { match: null, captureGroupKeys: [] };
  let n = s ? "" : "i", a = [];
  return { match: (0, D.default)(`%${t}%${n}`, a).exec(e), captureGroupKeys: a };
}
__name(k, "k");
function P(t, e, s, { namedOnly: n } = {}) {
  return t.replace(/\$([a-zA-Z0-9_]+)/g, (a, r) => {
    let i = s.indexOf(r);
    return n && i === -1 ? a : (i === -1 ? e[parseInt(r, 10)] : e[i + 1]) || "";
  });
}
__name(P, "P");
function A(t, { url: e, cookies: s, headers: n, routeDest: a }) {
  switch (t.type) {
    case "host":
      return { valid: e.hostname === t.value };
    case "header":
      return t.value !== void 0 ? I(t.value, n.get(t.key), a) : { valid: n.has(t.key) };
    case "cookie": {
      let r = s[t.key];
      return r && t.value !== void 0 ? I(t.value, r, a) : { valid: r !== void 0 };
    }
    case "query":
      return t.value !== void 0 ? I(t.value, e.searchParams.get(t.key), a) : { valid: e.searchParams.has(t.key) };
  }
}
__name(A, "A");
function I(t, e, s) {
  let { match: n, captureGroupKeys: a } = k(t, e);
  return s && n && a.length ? { valid: !!n, newRouteDest: P(s, n, a, { namedOnly: true }) } : { valid: !!n };
}
__name(I, "I");
u();
p();
d();
function B(t) {
  let e = new Headers(t.headers);
  return t.cf && (e.set("x-vercel-ip-city", encodeURIComponent(t.cf.city)), e.set("x-vercel-ip-country", t.cf.country), e.set("x-vercel-ip-country-region", t.cf.regionCode), e.set("x-vercel-ip-latitude", t.cf.latitude), e.set("x-vercel-ip-longitude", t.cf.longitude)), e.set("x-vercel-sc-host", b), new Request(t, { headers: e });
}
__name(B, "B");
u();
p();
d();
function y(t, e, s) {
  let n = e instanceof Headers ? e.entries() : Object.entries(e);
  for (let [a, r] of n) {
    let i = a.toLowerCase(), o = s?.match ? P(r, s.match, s.captureGroupKeys) : r;
    i === "set-cookie" ? t.append(i, o) : t.set(i, o);
  }
}
__name(y, "y");
function j(t) {
  return /^https?:\/\//.test(t);
}
__name(j, "j");
function x(t, e) {
  for (let [s, n] of e.entries()) {
    let a = /^nxtP(.+)$/.exec(s), r = /^nxtI(.+)$/.exec(s);
    a?.[1] ? (t.set(s, n), t.set(a[1], n)) : r?.[1] ? t.set(r[1], n.replace(/(\(\.+\))+/, "")) : (!t.has(s) || !!n && !t.getAll(s).includes(n)) && t.append(s, n);
  }
}
__name(x, "x");
function L(t, e) {
  let s = new URL(e, t.url);
  return x(s.searchParams, new URL(t.url).searchParams), s.pathname = s.pathname.replace(/\/index.html$/, "/").replace(/\.html$/, ""), new Request(s, t);
}
__name(L, "L");
function v(t) {
  return new Response(t.body, t);
}
__name(v, "v");
function O(t) {
  return t.split(",").map((e) => {
    let [s, n] = e.split(";"), a = parseFloat((n ?? "q=1").replace(/q *= */gi, ""));
    return [s.trim(), isNaN(a) ? 1 : a];
  }).sort((e, s) => s[1] - e[1]).map(([e]) => e === "*" || e === "" ? [] : e).flat();
}
__name(O, "O");
u();
p();
d();
function H(t) {
  switch (t) {
    case "none":
      return "filesystem";
    case "filesystem":
      return "rewrite";
    case "rewrite":
      return "resource";
    case "resource":
      return "miss";
    default:
      return "miss";
  }
}
__name(H, "H");
async function S(t, { request: e, assetsFetcher: s, ctx: n }, { path: a, searchParams: r }) {
  let i, o = new URL(e.url);
  x(o.searchParams, r);
  let c = new Request(o, e);
  try {
    switch (t?.type) {
      case "function":
      case "middleware": {
        let l = await import(t.entrypoint);
        try {
          i = await l.default(c, n);
        } catch (f) {
          let m = f;
          throw m.name === "TypeError" && m.message.endsWith("default is not a function") ? new Error(`An error occurred while evaluating the target edge function (${t.entrypoint})`) : f;
        }
        break;
      }
      case "override": {
        i = v(await s.fetch(L(c, t.path ?? a))), t.headers && y(i.headers, t.headers);
        break;
      }
      case "static": {
        i = await s.fetch(L(c, a));
        break;
      }
      default:
        i = new Response("Not Found", { status: 404 });
    }
  } catch (l) {
    return console.error(l), new Response("Internal Server Error", { status: 500 });
  }
  return v(i);
}
__name(S, "S");
function G(t, e) {
  let s = "^//?(?:", n = ")/(.*)$";
  return !t.startsWith(s) || !t.endsWith(n) ? false : t.slice(s.length, -n.length).split("|").every((r) => e.has(r));
}
__name(G, "G");
u();
p();
d();
function lt(t, { protocol: e, hostname: s, port: n, pathname: a }) {
  return !(e && t.protocol.replace(/:$/, "") !== e || !new RegExp(s).test(t.hostname) || n && !new RegExp(n).test(t.port) || a && !new RegExp(a).test(t.pathname));
}
__name(lt, "lt");
function ft(t, e) {
  if (t.method !== "GET") return;
  let { origin: s, searchParams: n } = new URL(t.url), a = n.get("url"), r = Number.parseInt(n.get("w") ?? "", 10), i = Number.parseInt(n.get("q") ?? "75", 10);
  if (!a || Number.isNaN(r) || Number.isNaN(i) || !e?.sizes?.includes(r) || i < 0 || i > 100) return;
  let o = new URL(a, s);
  if (o.pathname.endsWith(".svg") && !e?.dangerouslyAllowSVG) return;
  let c = a.startsWith("//"), l = a.startsWith("/") && !c;
  if (!l && !e?.domains?.includes(o.hostname) && !e?.remotePatterns?.find((R) => lt(o, R))) return;
  let f = t.headers.get("Accept") ?? "", m = e?.formats?.find((R) => f.includes(R))?.replace("image/", "");
  return { isRelative: l, imageUrl: o, options: { width: r, quality: i, format: m } };
}
__name(ft, "ft");
function ht(t, e, s) {
  let n = new Headers();
  if (s?.contentSecurityPolicy && n.set("Content-Security-Policy", s.contentSecurityPolicy), s?.contentDispositionType) {
    let r = e.pathname.split("/").pop(), i = r ? `${s.contentDispositionType}; filename="${r}"` : s.contentDispositionType;
    n.set("Content-Disposition", i);
  }
  t.headers.has("Cache-Control") || n.set("Cache-Control", `public, max-age=${s?.minimumCacheTTL ?? 60}`);
  let a = v(t);
  return y(a.headers, n), a;
}
__name(ht, "ht");
async function K(t, { buildOutput: e, assetsFetcher: s, imagesConfig: n }) {
  let a = ft(t, n);
  if (!a) return new Response("Invalid image resizing request", { status: 400 });
  let { isRelative: r, imageUrl: i } = a, c = await (r && i.pathname in e ? s.fetch.bind(s) : fetch)(i);
  return ht(c, i, n);
}
__name(K, "K");
u();
p();
d();
u();
p();
d();
u();
p();
d();
async function C(t) {
  return import(t);
}
__name(C, "C");
var _t = "x-vercel-cache-tags";
var gt = "x-next-cache-soft-tags";
var mt = /* @__PURE__ */ Symbol.for("__cloudflare-request-context__");
async function J(t) {
  let e = `https://${b}/v1/suspense-cache/`;
  if (!t.url.startsWith(e)) return null;
  try {
    let s = new URL(t.url), n = await yt();
    if (s.pathname === "/v1/suspense-cache/revalidate") {
      let r = s.searchParams.get("tags")?.split(",") ?? [];
      for (let i of r) await n.revalidateTag(i);
      return new Response(null, { status: 200 });
    }
    let a = s.pathname.replace("/v1/suspense-cache/", "");
    if (!a.length) return new Response("Invalid cache key", { status: 400 });
    switch (t.method) {
      case "GET": {
        let r = z(t, gt), i = await n.get(a, { softTags: r });
        return i ? new Response(JSON.stringify(i.value), { status: 200, headers: { "Content-Type": "application/json", "x-vercel-cache-state": "fresh", age: `${(Date.now() - (i.lastModified ?? Date.now())) / 1e3}` } }) : new Response(null, { status: 404 });
      }
      case "POST": {
        let r = globalThis[mt], i = /* @__PURE__ */ __name(async () => {
          let o = await t.json();
          o.data.tags === void 0 && (o.tags ??= z(t, _t) ?? []), await n.set(a, o);
        }, "i");
        return r ? r.ctx.waitUntil(i()) : await i(), new Response(null, { status: 200 });
      }
      default:
        return new Response(null, { status: 405 });
    }
  } catch (s) {
    return console.error(s), new Response("Error handling cache request", { status: 500 });
  }
}
__name(J, "J");
async function yt() {
  return process.env.__NEXT_ON_PAGES__KV_SUSPENSE_CACHE ? W("kv") : W("cache-api");
}
__name(yt, "yt");
async function W(t) {
  let e = `./__next-on-pages-dist__/cache/${t}.js`, s = await C(e);
  return new s.default();
}
__name(W, "W");
function z(t, e) {
  return t.headers.get(e)?.split(",")?.filter(Boolean);
}
__name(z, "z");
function X() {
  globalThis[Z] || (xt(), globalThis[Z] = true);
}
__name(X, "X");
function xt() {
  let t = globalThis.fetch;
  globalThis.fetch = async (...e) => {
    let s = new Request(...e), n = await wt(s);
    return n || (n = await J(s), n) ? n : (Rt(s), t(s));
  };
}
__name(xt, "xt");
async function wt(t) {
  if (t.url.startsWith("blob:")) try {
    let s = `./__next-on-pages-dist__/assets/${new URL(t.url).pathname}.bin`, n = (await C(s)).default, a = { async arrayBuffer() {
      return n;
    }, get body() {
      return new ReadableStream({ start(r) {
        let i = Buffer.from(n);
        r.enqueue(i), r.close();
      } });
    }, async text() {
      return Buffer.from(n).toString();
    }, async json() {
      let r = Buffer.from(n);
      return JSON.stringify(r.toString());
    }, async blob() {
      return new Blob(n);
    } };
    return a.clone = () => ({ ...a }), a;
  } catch {
  }
  return null;
}
__name(wt, "wt");
function Rt(t) {
  t.headers.has("user-agent") || t.headers.set("user-agent", "Next.js Middleware");
}
__name(Rt, "Rt");
var Z = /* @__PURE__ */ Symbol.for("next-on-pages fetch patch");
u();
p();
d();
var Y = $(Q());
var M = class {
  static {
    __name(this, "M");
  }
  constructor(e, s, n, a, r) {
    this.routes = e;
    this.output = s;
    this.reqCtx = n;
    this.url = new URL(n.request.url), this.cookies = (0, Y.parse)(n.request.headers.get("cookie") || ""), this.path = this.url.pathname || "/", this.headers = { normal: new Headers(), important: new Headers() }, this.searchParams = new URLSearchParams(), x(this.searchParams, this.url.searchParams), this.checkPhaseCounter = 0, this.middlewareInvoked = [], this.wildcardMatch = r?.find((i) => i.domain === this.url.hostname), this.locales = new Set(a.collectedLocales);
  }
  url;
  cookies;
  wildcardMatch;
  path;
  status;
  headers;
  searchParams;
  body;
  checkPhaseCounter;
  middlewareInvoked;
  locales;
  checkRouteMatch(e, { checkStatus: s, checkIntercept: n }) {
    let a = k(e.src, this.path, e.caseSensitive);
    if (!a.match || e.methods && !e.methods.map((i) => i.toUpperCase()).includes(this.reqCtx.request.method.toUpperCase())) return;
    let r = { url: this.url, cookies: this.cookies, headers: this.reqCtx.request.headers, routeDest: e.dest };
    if (!e.has?.find((i) => {
      let o = A(i, r);
      return o.newRouteDest && (r.routeDest = o.newRouteDest), !o.valid;
    }) && !e.missing?.find((i) => A(i, r).valid) && !(s && e.status !== this.status)) {
      if (n && e.dest) {
        let i = /\/(\(\.+\))+/, o = i.test(e.dest), c = i.test(this.path);
        if (o && !c) return;
      }
      return { routeMatch: a, routeDest: r.routeDest };
    }
  }
  processMiddlewareResp(e) {
    let s = "x-middleware-override-headers", n = e.headers.get(s);
    if (n) {
      let c = new Set(n.split(",").map((l) => l.trim()));
      for (let l of c.keys()) {
        let f = `x-middleware-request-${l}`, m = e.headers.get(f);
        this.reqCtx.request.headers.get(l) !== m && (m ? this.reqCtx.request.headers.set(l, m) : this.reqCtx.request.headers.delete(l)), e.headers.delete(f);
      }
      e.headers.delete(s);
    }
    let a = "x-middleware-rewrite", r = e.headers.get(a);
    if (r) {
      let c = new URL(r, this.url), l = this.url.hostname !== c.hostname;
      this.path = l ? `${c}` : c.pathname, x(this.searchParams, c.searchParams), e.headers.delete(a);
    }
    let i = "x-middleware-next";
    e.headers.get(i) ? e.headers.delete(i) : !r && !e.headers.has("location") ? (this.body = e.body, this.status = e.status) : e.headers.has("location") && e.status >= 300 && e.status < 400 && (this.status = e.status), y(this.reqCtx.request.headers, e.headers), y(this.headers.normal, e.headers), this.headers.middlewareLocation = e.headers.get("location");
  }
  async runRouteMiddleware(e) {
    if (!e) return true;
    let s = e && this.output[e];
    if (!s || s.type !== "middleware") return this.status = 500, false;
    let n = await S(s, this.reqCtx, { path: this.path, searchParams: this.searchParams, headers: this.headers, status: this.status });
    return this.middlewareInvoked.push(e), n.status === 500 ? (this.status = n.status, false) : (this.processMiddlewareResp(n), true);
  }
  applyRouteOverrides(e) {
    !e.override || (this.status = void 0, this.headers.normal = new Headers(), this.headers.important = new Headers());
  }
  applyRouteHeaders(e, s, n) {
    !e.headers || (y(this.headers.normal, e.headers, { match: s, captureGroupKeys: n }), e.important && y(this.headers.important, e.headers, { match: s, captureGroupKeys: n }));
  }
  applyRouteStatus(e) {
    !e.status || (this.status = e.status);
  }
  applyRouteDest(e, s, n) {
    if (!e.dest) return this.path;
    let a = this.path, r = e.dest;
    this.wildcardMatch && /\$wildcard/.test(r) && (r = r.replace(/\$wildcard/g, this.wildcardMatch.value)), this.path = P(r, s, n);
    let i = /\/index\.rsc$/i.test(this.path), o = /^\/(?:index)?$/i.test(a), c = /^\/__index\.prefetch\.rsc$/i.test(a);
    i && !o && !c && (this.path = a);
    let l = /\.rsc$/i.test(this.path), f = /\.prefetch\.rsc$/i.test(this.path), m = this.path in this.output;
    l && !f && !m && (this.path = this.path.replace(/\.rsc/i, ""));
    let R = new URL(this.path, this.url);
    return x(this.searchParams, R.searchParams), j(this.path) || (this.path = R.pathname), a;
  }
  applyLocaleRedirects(e) {
    if (!e.locale?.redirect || !/^\^(.)*$/.test(e.src) && e.src !== this.path || this.headers.normal.has("location")) return;
    let { locale: { redirect: n, cookie: a } } = e, r = a && this.cookies[a], i = O(r ?? ""), o = O(this.reqCtx.request.headers.get("accept-language") ?? ""), f = [...i, ...o].map((m) => n[m]).filter(Boolean)[0];
    if (f) {
      !this.path.startsWith(f) && (this.headers.normal.set("location", f), this.status = 307);
      return;
    }
  }
  getLocaleFriendlyRoute(e, s) {
    return !this.locales || s !== "miss" ? e : G(e.src, this.locales) ? { ...e, src: e.src.replace(/\/\(\.\*\)\$$/, "(?:/(.*))?$") } : e;
  }
  async checkRoute(e, s) {
    let n = this.getLocaleFriendlyRoute(s, e), { routeMatch: a, routeDest: r } = this.checkRouteMatch(n, { checkStatus: e === "error", checkIntercept: e === "rewrite" }) ?? {}, i = { ...n, dest: r };
    if (!a?.match || i.middlewarePath && this.middlewareInvoked.includes(i.middlewarePath)) return "skip";
    let { match: o, captureGroupKeys: c } = a;
    if (this.applyRouteOverrides(i), this.applyLocaleRedirects(i), !await this.runRouteMiddleware(i.middlewarePath)) return "error";
    if (this.body !== void 0 || this.headers.middlewareLocation) return "done";
    this.applyRouteHeaders(i, o, c), this.applyRouteStatus(i);
    let f = this.applyRouteDest(i, o, c);
    if (i.check && !j(this.path)) if (f === this.path) {
      if (e !== "miss") return this.checkPhase(H(e));
      this.status = 404;
    } else if (e === "miss") {
      if (!(this.path in this.output) && !(this.path.replace(/\/$/, "") in this.output)) return this.checkPhase("filesystem");
      this.status === 404 && (this.status = void 0);
    } else return this.checkPhase("none");
    return !i.continue || i.status && i.status >= 300 && i.status <= 399 ? "done" : "next";
  }
  async checkPhase(e) {
    if (this.checkPhaseCounter++ >= 50) return console.error(`Routing encountered an infinite loop while checking ${this.url.pathname}`), this.status = 500, "error";
    this.middlewareInvoked = [];
    let s = true;
    for (let r of this.routes[e]) {
      let i = await this.checkRoute(e, r);
      if (i === "error") return "error";
      if (i === "done") {
        s = false;
        break;
      }
    }
    if (e === "hit" || j(this.path) || this.headers.normal.has("location") || !!this.body) return "done";
    if (e === "none") for (let r of this.locales) {
      let i = new RegExp(`/${r}(/.*)`), c = this.path.match(i)?.[1];
      if (c && c in this.output) {
        this.path = c;
        break;
      }
    }
    let n = this.path in this.output;
    if (!n && this.path.endsWith("/")) {
      let r = this.path.replace(/\/$/, "");
      n = r in this.output, n && (this.path = r);
    }
    if (e === "miss" && !n) {
      let r = !this.status || this.status < 400;
      this.status = r ? 404 : this.status;
    }
    let a = "miss";
    return n || e === "miss" || e === "error" ? a = "hit" : s && (a = H(e)), this.checkPhase(a);
  }
  async run(e = "none") {
    this.checkPhaseCounter = 0;
    let s = await this.checkPhase(e);
    return this.headers.normal.has("location") && (!this.status || this.status < 300 || this.status >= 400) && (this.status = 307), s;
  }
};
async function tt(t, e, s, n) {
  let a = new M(e.routes, s, t, n, e.wildcard), r = await et(a);
  return Et(t, r, s);
}
__name(tt, "tt");
async function et(t, e = "none", s = false) {
  return await t.run(e) === "error" || !s && t.status && t.status >= 400 ? et(t, "error", true) : { path: t.path, status: t.status, headers: t.headers, searchParams: t.searchParams, body: t.body };
}
__name(et, "et");
async function Et(t, { path: e = "/404", status: s, headers: n, searchParams: a, body: r }, i) {
  let o = n.normal.get("location");
  if (o) {
    if (o !== n.middlewareLocation) {
      let f = [...a.keys()].length ? `?${a.toString()}` : "";
      n.normal.set("location", `${o ?? "/"}${f}`);
    }
    return new Response(null, { status: s, headers: n.normal });
  }
  let c;
  if (r !== void 0) c = new Response(r, { status: s });
  else if (j(e)) {
    let f = new URL(e);
    x(f.searchParams, a), c = await fetch(f, t.request);
  } else c = await S(i[e], t, { path: e, status: s, headers: n, searchParams: a });
  let l = n.normal;
  return y(l, c.headers), y(l, n.important), c = new Response(c.body, { ...c, status: s || c.status, headers: l }), c;
}
__name(Et, "Et");
u();
p();
d();
function nt() {
  globalThis.__nextOnPagesRoutesIsolation ??= { _map: /* @__PURE__ */ new Map(), getProxyFor: Mt };
}
__name(nt, "nt");
function Mt(t) {
  let e = globalThis.__nextOnPagesRoutesIsolation._map.get(t);
  if (e) return e;
  let s = Tt();
  return globalThis.__nextOnPagesRoutesIsolation._map.set(t, s), s;
}
__name(Mt, "Mt");
function Tt() {
  let t = /* @__PURE__ */ new Map();
  return new Proxy(globalThis, { get: /* @__PURE__ */ __name((e, s) => t.has(s) ? t.get(s) : Reflect.get(globalThis, s), "get"), set: /* @__PURE__ */ __name((e, s, n) => It.has(s) ? Reflect.set(globalThis, s, n) : (t.set(s, n), true), "set") });
}
__name(Tt, "Tt");
var It = /* @__PURE__ */ new Set(["_nextOriginalFetch", "fetch", "__incrementalCache"]);
var At = Object.defineProperty;
var Lt = /* @__PURE__ */ __name((...t) => {
  let e = t[0], s = t[1], n = "__import_unsupported";
  if (!(s === n && typeof e == "object" && e !== null && n in e)) return At(...t);
}, "Lt");
globalThis.Object.defineProperty = Lt;
globalThis.AbortController = class extends AbortController {
  constructor() {
    try {
      super();
    } catch (e) {
      if (e instanceof Error && e.message.includes("Disallowed operation called within global scope")) return { signal: { aborted: false, reason: null, onabort: /* @__PURE__ */ __name(() => {
      }, "onabort"), throwIfAborted: /* @__PURE__ */ __name(() => {
      }, "throwIfAborted") }, abort() {
      } };
      throw e;
    }
  }
};
var kn = { async fetch(t, e, s) {
  nt(), X();
  let n = await __ALSes_PROMISE__;
  if (!n) {
    let i = new URL(t.url), o = await e.ASSETS.fetch(`${i.protocol}//${i.host}/cdn-cgi/errors/no-nodejs_compat.html`), c = o.ok ? o.body : "Error: Could not access built-in Node.js modules. Please make sure that your Cloudflare Pages project has the 'nodejs_compat' compatibility flag set.";
    return new Response(c, { status: 503 });
  }
  let { envAsyncLocalStorage: a, requestContextAsyncLocalStorage: r } = n;
  return a.run({ ...e, NODE_ENV: "production", SUSPENSE_CACHE_URL: b }, async () => r.run({ env: e, ctx: s, cf: t.cf }, async () => {
    if (new URL(t.url).pathname.startsWith("/_next/image")) return K(t, { buildOutput: _, assetsFetcher: e.ASSETS, imagesConfig: h.images });
    let o = B(t);
    return tt({ request: o, ctx: s, assetsFetcher: e.ASSETS }, h, _, g);
  }));
} };
export {
  kn as default
};
/*!
 * cookie
 * Copyright(c) 2012-2014 Roman Shtylman
 * Copyright(c) 2015 Douglas Christopher Wilson
 * MIT Licensed
 */
//# sourceMappingURL=bundledWorker-0.4561809569852293.mjs.map
