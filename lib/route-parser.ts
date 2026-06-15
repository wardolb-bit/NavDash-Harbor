import type { RouteFileType } from "@/lib/types";

export type ParsedWaypoint = {
  sequence: number;
  name: string;
  latitude: number | null;
  longitude: number | null;
  remarks: string | null;
};

function numeric(value: string | null) {
  if (value === null || value.trim() === "") {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function decodeXml(value: string) {
  return value
    .replaceAll("&amp;", "&")
    .replaceAll("&lt;", "<")
    .replaceAll("&gt;", ">")
    .replaceAll("&quot;", '"')
    .replaceAll("&apos;", "'");
}

function readAttribute(fragment: string, attr: string) {
  const pattern = new RegExp(`(?:^|\\s|:)${attr}\\s*=\\s*["']([^"']*)["']`, "i");
  return fragment.match(pattern)?.[1] ?? null;
}

function readChildText(fragment: string, tagName: string) {
  const pattern = new RegExp(`<(?:\\w+:)?${tagName}\\b[^>]*>([\\s\\S]*?)<\\/(?:\\w+:)?${tagName}>`, "i");
  const value = fragment.match(pattern)?.[1]?.trim();
  return value ? decodeXml(value) : null;
}

function readFirstTag(fragment: string, tagName: string) {
  const pattern = new RegExp(`<(?:\\w+:)?${tagName}\\b[^>]*>`, "i");
  return fragment.match(pattern)?.[0] ?? null;
}

function readTagBlocks(text: string, tagName: string) {
  const pattern = new RegExp(`<(?:\\w+:)?${tagName}\\b[^>]*>[\\s\\S]*?<\\/(?:\\w+:)?${tagName}>`, "gi");
  return text.match(pattern) ?? [];
}

function waypointName(fragment: string, index: number) {
  const openingTag = readFirstTag(fragment, "waypoint") ?? readFirstTag(fragment, "wpt") ?? readFirstTag(fragment, "rtept");
  const attrName = openingTag ? readAttribute(openingTag, "name") : null;
  const childName = readChildText(fragment, "name");
  const id = openingTag ? readAttribute(openingTag, "id") : null;
  return decodeXml(attrName ?? childName ?? id ?? `WP ${index + 1}`);
}

function parseCsvWaypoints(text: string): ParsedWaypoint[] {
  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split(",").map((cell) => cell.trim()))
    .filter((row) => row.some(Boolean));
  const header = rows[0]?.map((cell) => cell.toLowerCase()) ?? [];
  const hasHeader = header.some((cell) => ["lat", "latitude", "lon", "longitude", "lng", "name", "waypoint"].includes(cell));
  const dataRows = hasHeader ? rows.slice(1) : rows;
  const nameIndex = hasHeader ? Math.max(header.findIndex((cell) => cell === "name" || cell === "waypoint"), 0) : 0;
  const latIndex = hasHeader ? header.findIndex((cell) => cell === "lat" || cell === "latitude") : 1;
  const lonIndex = hasHeader ? header.findIndex((cell) => cell === "lon" || cell === "longitude" || cell === "lng") : 2;

  return dataRows.slice(0, 500).map((row, index) => ({
    sequence: index + 1,
    name: row[nameIndex] || `WP ${index + 1}`,
    latitude: numeric(row[latIndex] ?? null),
    longitude: numeric(row[lonIndex] ?? null),
    remarks: null,
  }));
}

function parseRtzWaypoints(text: string): ParsedWaypoint[] {
  return readTagBlocks(text, "waypoint")
    .slice(0, 500)
    .map((waypoint, index) => {
      const openingTag = readFirstTag(waypoint, "waypoint");
      const positionTag = readFirstTag(waypoint, "position") ?? openingTag;
      const lat = positionTag ? readAttribute(positionTag, "lat") ?? readAttribute(positionTag, "latitude") : null;
      const lon = positionTag ? readAttribute(positionTag, "lon") ?? readAttribute(positionTag, "longitude") : null;
      const turnRadius = openingTag ? readAttribute(openingTag, "radius") : null;
      const legNote = readChildText(waypoint, "leg") ?? readChildText(waypoint, "remarks");

      return {
        sequence: index + 1,
        name: waypointName(waypoint, index),
        latitude: numeric(lat),
        longitude: numeric(lon),
        remarks: legNote ?? (turnRadius ? `Turn radius: ${turnRadius}` : null),
      };
    })
    .filter((waypoint) => waypoint.latitude !== null || waypoint.longitude !== null || waypoint.name);
}

function parseGpxWaypoints(text: string): ParsedWaypoint[] {
  const blocks = [...readTagBlocks(text, "wpt"), ...readTagBlocks(text, "rtept")];

  return blocks.slice(0, 500).map((point, index) => {
    const openingTag = readFirstTag(point, "wpt") ?? readFirstTag(point, "rtept");
    return {
      sequence: index + 1,
      name: waypointName(point, index),
      latitude: openingTag ? numeric(readAttribute(openingTag, "lat")) : null,
      longitude: openingTag ? numeric(readAttribute(openingTag, "lon")) : null,
      remarks: readChildText(point, "desc") ?? readChildText(point, "cmt"),
    };
  });
}

function parseKmlWaypoints(text: string): ParsedWaypoint[] {
  const coordinateBlocks = readTagBlocks(text, "coordinates");
  const coordinates = coordinateBlocks
    .flatMap((block) => block.replace(/<\/?(?:\w+:)?coordinates[^>]*>/gi, "").trim().split(/\s+/))
    .map((coordinate) => coordinate.split(","))
    .filter((parts) => parts.length >= 2)
    .slice(0, 500);

  return coordinates.map(([lon, lat], index) => ({
    sequence: index + 1,
    name: `WP ${index + 1}`,
    latitude: numeric(lat),
    longitude: numeric(lon),
    remarks: null,
  }));
}

function parseGenericXmlWaypoints(text: string): ParsedWaypoint[] {
  const rtz = parseRtzWaypoints(text);
  if (rtz.length > 0) {
    return rtz;
  }

  return parseGpxWaypoints(text);
}

export function parseRouteWaypoints(text: string, fileType: RouteFileType): ParsedWaypoint[] {
  if (fileType === "CSV") {
    return parseCsvWaypoints(text);
  }

  if (fileType === "RTZ") {
    return parseRtzWaypoints(text);
  }

  if (fileType === "GPX") {
    return parseGpxWaypoints(text);
  }

  if (fileType === "KML") {
    return parseKmlWaypoints(text);
  }

  return parseGenericXmlWaypoints(text);
}
