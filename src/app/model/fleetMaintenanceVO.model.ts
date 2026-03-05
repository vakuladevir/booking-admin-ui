export class FleetMaintenanceVO {
    fleetId?: number;
    vehicleId!: number;
    vehicleCode!: string;
    vehicleType!: string;
    partnerId?: number;
    bpCode!: string;
    partnerName!: string;
    lastServiceDate!: string;
    serviceDueOn!: string;
    serviceAgentName!: string;
    serviceAgentPhoneNumber!: string;
    insuranceStatus!: string;
    insuranceExpiryDate!: string;
    vehicleCondition!: string;
    approverName!: string;
    isApproved!: boolean;
    createdBy!: string;
    creationDate?: string;
    updatedBy?: string;
    updationDate?: string;
  }
  