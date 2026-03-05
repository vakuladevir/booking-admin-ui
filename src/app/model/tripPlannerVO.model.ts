import { TripSeaterVO } from './tripSeaterVO.model';

export class TripPlannerVO {
    tripPlannerId!: number;
    tripGroupId!: string;
    tripId!: number;
    tripType!: string;
    isLtp!: boolean;
    routeCode1!: string;
    routeCode2!: string;
    fromLoc!: string;
    toLoc!: string;
    srcStartDate!: string;
    desEndDate!: string;
    rtFromLoc!: string;
    rtToLoc!: string;
    rtSrcStartDate!: string;
    rtDesEndDate!: string;
    vehicleId!: number;
    vehicleCode!: string;
    fleetId!: number;
    driverId!: number;
    driverPhoneNo!: string;
    returnDriverId!: number;
    returnDriverPhoneNo!: string;
    budgetId?: number;
    tripCost?: number;
    noOfSeats!: number;
    costPerSeat?: number;
    itemName!: string;
    itemIds!: string;
    tripStatus!: string;
    createdBy!: string;
    creationDate!: Date;
    updatedBy?: string;
    updationDate?: Date;
    seatPricing?: TripSeaterVO[];
    budgetVersion?: number;

    // LTP UI support fields
    mainTripFrequency?: number;
    mainTripFrequencyType?: string; // 'hours' or 'days' for oneway LTP
    returnTripOffset?: number;

    constructor() {
        // Initialize with default values if needed
    }
}
