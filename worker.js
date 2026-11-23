// Runs the Fortran solver (compiled to WebAssembly) off the main thread.
importScripts('fs2d.js');
onmessage = async (e) => {
  if (e.data.cmd !== 'run') return;
  const send = (line, err) => postMessage({ type: 'log', line, err: !!err });
  try {
    const mod = await createSolver({ print: (l) => send(l), printErr: (l) => send(l, true) });
    mod.FS.mkdir('outputs');
    postMessage({ type: 'started' });
    const t0 = performance.now();
    const rc = mod.callMain([]);
    let gauges = null;
    try { gauges = mod.FS.readFile('outputs/gauge_timeseries.dat', { encoding: 'utf8' }); } catch (_) {}
    postMessage({ type: 'done', rc, gauges, wall: (performance.now() - t0) / 1000 });
  } catch (err) {
    postMessage({ type: 'error', message: String(err && err.message || err) });
  }
};
