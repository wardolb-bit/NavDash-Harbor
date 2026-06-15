const { parseRouteWaypoints } = require("../lib/route-parser") as typeof import("../lib/route-parser");

const samples = {
  rtz: `<?xml version="1.0" encoding="UTF-8"?>
<route xmlns="http://www.cirm.org/RTZ/1/0" version="1.0">
  <waypoints>
    <waypoint id="001" name="Pilot Station">
      <position lat="13.444300" lon="144.793700" />
    </waypoint>
    <waypoint id="002" name="Sea Buoy">
      <position lat="13.501000" lon="144.900000" />
    </waypoint>
  </waypoints>
</route>`,
  gpx: `<gpx><rte><rtept lat="13.1" lon="144.1"><name>GPX One</name></rtept></rte></gpx>`,
  kml: `<kml><Document><Placemark><LineString><coordinates>144.1,13.1,0 144.2,13.2,0</coordinates></LineString></Placemark></Document></kml>`,
  csv: `name,latitude,longitude
CSV One,13.1,144.1
CSV Two,13.2,144.2`,
};

const checks = [
  { label: "RTZ", rows: parseRouteWaypoints(samples.rtz, "RTZ"), expected: 2 },
  { label: "GPX", rows: parseRouteWaypoints(samples.gpx, "GPX"), expected: 1 },
  { label: "KML", rows: parseRouteWaypoints(samples.kml, "KML"), expected: 2 },
  { label: "CSV", rows: parseRouteWaypoints(samples.csv, "CSV"), expected: 2 },
];

for (const check of checks) {
  if (check.rows.length !== check.expected) {
    throw new Error(`${check.label} parsed ${check.rows.length} waypoints, expected ${check.expected}.`);
  }

  if (check.rows.some((row) => row.latitude === null || row.longitude === null)) {
    throw new Error(`${check.label} produced a waypoint without coordinates.`);
  }
}

console.table(checks.map((check) => ({
  type: check.label,
  waypoints: check.rows.length,
  first: check.rows[0].name,
  lat: check.rows[0].latitude,
  lon: check.rows[0].longitude,
})));
