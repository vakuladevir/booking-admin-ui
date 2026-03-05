import { StopMapVO } from "./stopMapVO.model";

export class RouteMapVO {
    routeMapId?: number;
    routeMapCode?: string;
    fromLocation!: string;
    toLocation!: string;
    viaLocation!: string;
    viaPlace!: string;
    stopMapList?: StopMapVO[];
    distanceKm!: number;
    tollCount?: number;
    driverBeta?: number;
    createdBy!: string;
    creationDate?: Date;
    updatedBy?: string;
    updationDate?: Date;
  }
  