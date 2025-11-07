export interface GeospatialTask {
  id: string;
  name: string;
  description: string;
  location: {
    latitude: number;
    longitude: number;
  };
}
