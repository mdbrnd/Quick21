// Created with the help of ChatGPT

const serializeMap = (map: Map<any, any>) => {
  return Array.from(map.entries());
};

const deserializeMap = (array: any[]) => {
  return new Map(array);
};

export { serializeMap, deserializeMap };
