const DEFAULT_BASE_URL = "http://localhost:3000";
const DEFAULT_ROUTES = ["/login", "/register", "/dashboard", "/tickets", "/admin"];

function parseArgs(argv) {
  const options = {
    baseUrl: process.env.PERF_BASE_URL || DEFAULT_BASE_URL,
    cookie: process.env.PERF_COOKIE || "",
    passes: 2,
    followRedirects: false,
    routes: [],
  };

  for (const arg of argv) {
    if (arg.startsWith("--base=")) {
      options.baseUrl = arg.slice("--base=".length);
      continue;
    }

    if (arg.startsWith("--passes=")) {
      const value = Number(arg.slice("--passes=".length));
      if (Number.isInteger(value) && value > 0) {
        options.passes = value;
      }
      continue;
    }

    if (arg.startsWith("--cookie=")) {
      options.cookie = arg.slice("--cookie=".length);
      continue;
    }

    if (arg === "--follow-redirects") {
      options.followRedirects = true;
      continue;
    }

    if (arg.startsWith("http://") || arg.startsWith("https://")) {
      options.baseUrl = arg;
      continue;
    }

    options.routes.push(arg);
  }

  if (!options.routes.length) {
    options.routes = DEFAULT_ROUTES;
  }

  return options;
}

async function measureRequest(baseUrl, route, headers, redirect) {
  const startedAt = performance.now();
  const response = await fetch(new URL(route, baseUrl), {
    headers,
    redirect,
  });
  const elapsedMs = Math.round(performance.now() - startedAt);

  return {
    route,
    elapsedMs,
    status: response.status,
    location: response.headers.get("location") || "",
  };
}

function summarizeRoute(measurements) {
  const first = measurements[0];
  const second = measurements[1];
  const last = measurements[measurements.length - 1];
  const noteParts = [];

  if (last.status >= 300 && last.status < 400) {
    noteParts.push("redirect");
  }

  if (measurements.length > 1 && second && first.elapsedMs > second.elapsedMs * 3) {
    noteParts.push("cold start likely");
  }

  return {
    route: first.route,
    first_ms: first.elapsedMs,
    second_ms: second?.elapsedMs ?? "-",
    last_status: last.status,
    location: last.location || "-",
    note: noteParts.join(", ") || "-",
  };
}

async function main() {
  const options = parseArgs(process.argv.slice(2));
  const headers = options.cookie ? { Cookie: options.cookie } : {};
  const redirect = options.followRedirects ? "follow" : "manual";

  console.log(`Base URL: ${options.baseUrl}`);
  console.log(`Redirect mode: ${redirect}`);
  console.log(`Passes: ${options.passes}`);
  console.log(`Routes: ${options.routes.join(", ")}`);
  if (!options.cookie) {
    console.log("Cookie: none (protected routes may redirect to /login)");
  }

  const results = [];

  for (const route of options.routes) {
    const measurements = [];

    for (let pass = 0; pass < options.passes; pass += 1) {
      measurements.push(
        await measureRequest(options.baseUrl, route, headers, redirect),
      );
    }

    results.push(summarizeRoute(measurements));
  }

  console.table(results);
}

main().catch((error) => {
  console.error("Failed to measure routes.");
  console.error(error);
  process.exitCode = 1;
});
