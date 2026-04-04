declare namespace kakao {
  namespace maps {
    function load(callback: () => void): void;

    class Map {
      constructor(container: HTMLElement, options: MapOptions);
      setCenter(latlng: LatLng): void;
      getCenter(): LatLng;
      setLevel(level: number): void;
      getLevel(): number;
      setBounds(bounds: LatLngBounds, paddingTop?: number, paddingRight?: number, paddingBottom?: number, paddingLeft?: number): void;
    }

    class LatLng {
      constructor(lat: number, lng: number);
      getLat(): number;
      getLng(): number;
    }

    class LatLngBounds {
      constructor(sw?: LatLng, ne?: LatLng);
      extend(latlng: LatLng): void;
      getSouthWest(): LatLng;
      getNorthEast(): LatLng;
      isEmpty(): boolean;
    }

    class Marker {
      constructor(options: MarkerOptions);
      setMap(map: Map | null): void;
      getPosition(): LatLng;
      setPosition(latlng: LatLng): void;
    }

    class CustomOverlay {
      constructor(options: CustomOverlayOptions);
      setMap(map: Map | null): void;
      setPosition(latlng: LatLng): void;
      getPosition(): LatLng;
    }

    class Polyline {
      constructor(options: PolylineOptions);
      setMap(map: Map | null): void;
      getPath(): LatLng[];
      setPath(path: LatLng[]): void;
    }

    class Size {
      constructor(width: number, height: number);
    }

    class Point {
      constructor(x: number, y: number);
    }

    class MarkerImage {
      constructor(src: string, size: Size, options?: MarkerImageOptions);
    }

    interface MapOptions {
      center: LatLng;
      level: number;
      mapTypeId?: MapTypeId;
    }

    interface MarkerOptions {
      position: LatLng;
      map?: Map;
      image?: MarkerImage;
      title?: string;
      clickable?: boolean;
    }

    interface MarkerImageOptions {
      offset?: Point;
      alt?: string;
      coords?: string;
      shape?: string;
    }

    interface CustomOverlayOptions {
      position: LatLng;
      content: string | HTMLElement;
      map?: Map;
      xAnchor?: number;
      yAnchor?: number;
      zIndex?: number;
    }

    interface PolylineOptions {
      path: LatLng[];
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      strokeStyle?: string;
      map?: Map;
    }

    enum MapTypeId {
      ROADMAP = 1,
      SKYVIEW = 2,
      HYBRID = 3,
    }

    namespace event {
      function addListener(target: object, type: string, handler: (...args: unknown[]) => void): void;
      function removeListener(target: object, type: string, handler: (...args: unknown[]) => void): void;
    }

    namespace services {
      enum Status {
        OK = 'OK',
        ZERO_RESULT = 'ZERO_RESULT',
        ERROR = 'ERROR',
      }

      enum SortBy {
        ACCURACY = 'accuracy',
        DISTANCE = 'distance',
      }

      interface PlacesSearchOptions {
        location?: LatLng;
        x?: number;
        y?: number;
        radius?: number;
        bounds?: LatLngBounds;
        page?: number;
        size?: number;
        sort?: SortBy;
        category_group_code?: string;
      }

      interface PlacesSearchResult {
        id: string;
        place_name: string;
        category_name: string;
        category_group_code: string;
        category_group_name: string;
        phone: string;
        address_name: string;
        road_address_name: string;
        x: string;
        y: string;
        place_url: string;
        distance: string;
      }

      interface Pagination {
        totalCount: number;
        hasNextPage: boolean;
        hasPrevPage: boolean;
        current: number;
        gotoPage(page: number): void;
        gotoFirst(): void;
        gotoLast(): void;
        nextPage(): void;
        prevPage(): void;
      }

      type PlacesSearchCallback = (
        result: PlacesSearchResult[],
        status: Status,
        pagination: Pagination,
      ) => void;

      class Places {
        constructor(map?: Map);
        keywordSearch(keyword: string, callback: PlacesSearchCallback, options?: PlacesSearchOptions): void;
        categorySearch(code: string, callback: PlacesSearchCallback, options?: PlacesSearchOptions): void;
        setMap(map: Map | null): void;
      }

      interface AddressResult {
        address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          mountain_yn: string;
          main_address_no: string;
          sub_address_no: string;
        };
        road_address: {
          address_name: string;
          region_1depth_name: string;
          region_2depth_name: string;
          region_3depth_name: string;
          road_name: string;
          underground_yn: string;
          main_building_no: string;
          sub_building_no: string;
          building_name: string;
          zone_no: string;
        } | null;
      }

      type Coord2AddressCallback = (
        result: AddressResult[],
        status: Status,
      ) => void;

      class Geocoder {
        constructor();
        coord2Address(lng: number, lat: number, callback: Coord2AddressCallback): void;
        addressSearch(addr: string, callback: (result: { x: string; y: string; address_name: string }[], status: Status) => void): void;
      }
    }
  }
}
