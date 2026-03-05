export interface SeatInfo {
  seatNumber: string;
  seatType: 'window' | 'middle' | 'aisle' | 'lower' | 'upper' | 'berth' | string;
  price: number;
  editable?: boolean;
}

export interface VehicleSeatLayout {
  imageUrl: string;
  seats: SeatInfo[];
}
