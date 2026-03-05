# Seating Arrangement Implementation

## Overview
Updated the Trip Planner component to support new seating arrangements for different vehicle types (Seater, Sleeper, Semi Sleeper) with proper filtering of driver and empty seats from pricing calculations.

## Changes Made

### 1. New Seat Type Codes

#### Seater Vehicle Types
- **RWD** - Right Window Driver (excluded from pricing)
- **MS** - Middle Seater
- **LWS** - Left Window Seater
- **RWS** - Right Window Seater

#### Sleeper Vehicle Types - Lower Berths
- **RWLO** - Right Window Lower
- **RMLO** - Right Middle Lower
- **LWLO** - Left Window Lower
- **LMLO** - Left Middle Lower

#### Sleeper Vehicle Types - Upper Berths
- **RWU** - Right Window Upper
- **RMU** - Right Middle Upper
- **LWU** - Left Window Upper
- **LMU** - Left Middle Upper

#### Semi Sleeper (Future Expansion)
- **RWSS** - Right Window Semi Sleeper
- **RMSS** - Right Middle Semi Sleeper
- **LWSS** - Left Window Semi Sleeper
- **LMSS** - Left Middle Semi Sleeper

#### Special Seats (Excluded from Pricing)
- **E** - Empty seat
- **RWD** - Driver seat

### 2. Updated Functions

#### `getSeatTypeFullForm(type: string): string`
Maps seat type codes to their full descriptive names for all vehicle types.

#### `isSeatPriceable(seatType: string): boolean`
**Purpose**: Determines if a seat should be included in pricing calculations.

**Excluded Seat Types**:
- `RWD` - Driver seats
- `E` - Empty seats
- `DRIVER` - Alternative driver designation
- `EMPTY` - Alternative empty designation

**Returns**: `true` if seat should be priced, `false` otherwise.

### 3. Seat Layout Parsing

#### Vehicle Selection - `selectVehicle()`
- Parses seating information from backend (format: `"0-RWD,1-MS,2-LWS,3-RWS,4-MS,..."`)
- **Filters out non-priceable seats** using `isSeatPriceable()`
- Updates seat count to reflect only priceable seats
- Logs the number of priceable seats loaded

### 4. Pricing Calculations

#### `updateSeatPricing()`
- Only sums prices for priceable seats
- Excludes driver and empty seats from total calculation
- Updates `seatMapTotal` with sum of priceable seat prices only

### 5. UI Updates

#### Seat Map Display (HTML)
- Added informational alert explaining that only priceable seats are shown
- Visual border highlighting for priceable seats (green border)
- Shows count of priceable seats in the total display
- Displays "Seat X" prefix for clarity
- Shows full seat type names using `getSeatTypeFullForm()`

## Example Seating Layouts

### Seater Vehicle Example
```
Format: I-1;ROW1-RWD-0, MS-1, LWS-2;ROW2-RWS-3, MS-4, E;ROW3-RWS-5, MS-6, LWS-7;...

Backend Data: "0-RWD,1-MS,2-LWS,3-RWS,4-MS,5-E,6-RWS,7-MS,8-LWS,..."

Priceable Seats (displayed): 
- Seat 1 (MS)
- Seat 2 (LWS)
- Seat 3 (RWS)
- Seat 4 (MS)
- Seat 6 (RWS) - Note: Seat 5 (E) is filtered out
- Seat 7 (MS)
- Seat 8 (LWS)
- ...

Total Priceable Seats: 17 (excludes 1 driver + any empty seats)
```

### Sleeper Vehicle Example
```
Format: 
I-1;ROW1-RWD-0;ROW2-RWLO-1, RMLO-2, E, LWLO-3;...
I-2;ROW1-E;ROW2-RWU-22, RMU-23, E, LWU-24;...

Backend Data: "0-RWD,1-RWLO,2-RMLO,3-E,4-LWLO,5-RWLO,6-RMLO,7-E,8-LWLO,..."

Priceable Seats (displayed):
Lower Berths:
- Seat 1 (RWLO)
- Seat 2 (RMLO)
- Seat 4 (LWLO)
- ...

Upper Berths:
- Seat 22 (RWU)
- Seat 23 (RMU)
- Seat 24 (LWU)
- ...

Total Priceable Seats: 39 (excludes driver and empty positions)
```

## Backend Requirements

The backend should provide vehicle seating information in the following format:

### VehicleMaster/VehicleDetails API Response
```json
{
  "vehicleId": 1,
  "vehicleCode": "BUS001",
  "vehicleType": "Seater",
  "seatingCapacity": 40,
  "seatingImageUrl": "/assets/images/bus-seater-layout.png",
  "seatingInfo": "0-RWD,1-MS,2-LWS,3-RWS,4-MS,5-E,6-RWS,7-MS,8-LWS,9-RWS,..."
}
```

### Format Specifications
- **Comma-separated** list of seat entries
- Each entry: `{seatNumber}-{seatType}`
- Seat numbers can be 0-based or 1-based (typically 0 for driver)
- Include ALL seats (driver, empty, and passenger) in the data
- Frontend will filter non-priceable seats automatically

### Seat Type Naming Convention
- Use uppercase abbreviations (RWD, MS, LWS, etc.)
- Use "E" for empty seats
- Driver seat should be numbered 0 with type "RWD"

## Testing Checklist

- [ ] Seater vehicle loads with correct seat types
- [ ] Driver seat (RWD-0) is filtered from pricing
- [ ] Empty seats (E) are filtered from pricing
- [ ] Sleeper vehicle loads with upper and lower berths
- [ ] Semi-sleeper vehicle support (when implemented)
- [ ] Seat count reflects only priceable seats
- [ ] Total seat cost calculates correctly (excludes driver/empty)
- [ ] Seat pricing UI shows only priceable seats
- [ ] Seat type full names display correctly
- [ ] Trip cost validation works with filtered seat count
- [ ] LTP trip generation includes correct seat pricing
- [ ] Calendar view displays seat pricing correctly

## Future Enhancements

1. **Dynamic Pricing by Seat Type**
   - Window seats premium pricing
   - Middle seats standard pricing
   - Upper/Lower berth differential pricing

2. **Seat Position Visualization**
   - Color coding by seat type
   - Interactive seat map with click-to-price
   - Visual grouping by rows

3. **Semi-Sleeper Implementation**
   - Add semi-sleeper specific seat codes
   - Implement reclining seat pricing logic

4. **Seat Availability Management**
   - Track booked vs available seats
   - Real-time seat availability updates
   - Seat blocking for maintenance

## Modified Files

1. **trip-planner.component.ts**
   - Updated `getSeatTypeFullForm()` with new seat codes
   - Added `isSeatPriceable()` function
   - Modified `selectVehicle()` to filter non-priceable seats
   - Updated `updateSeatPricing()` to exclude driver/empty seats

2. **trip-planner.component.html**
   - Added informational alert about priceable seats
   - Enhanced seat card display with visual indicators
   - Updated total display to show priceable seat count

3. **seat-layout.model.ts** (no changes needed - already flexible)

## Notes

- Backward compatible with legacy seat codes (SW, SM, LW, etc.)
- Filtering happens client-side for flexibility
- Backend seating data should include ALL seats for complete layout visualization if needed
- Only priceable seats are displayed in pricing UI
- Console logs show count of priceable seats for debugging
