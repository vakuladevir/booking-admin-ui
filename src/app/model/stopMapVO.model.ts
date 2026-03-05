export class StopMapVO {
    stopMapId?: number;
    routeMapId?: number;
    routeId!: number | null;
    placeId!: number;
    stopName!: string;
    sortNumber!: number;
    createdBy!: string;
    creationDate?: Date;
    updatedBy?: string;
    updationDate?: Date;
  }