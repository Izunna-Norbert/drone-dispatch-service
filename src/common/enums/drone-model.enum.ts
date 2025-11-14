export enum DroneModel {
  LIGHTWEIGHT = 'Lightweight',
  MIDDLEWEIGHT = 'Middleweight',
  CRUISERWEIGHT = 'Cruiserweight',
  HEAVYWEIGHT = 'Heavyweight',
}

// Weight limits for each model
export const MODEL_WEIGHT_LIMITS: Record<DroneModel, number> = {
  [DroneModel.LIGHTWEIGHT]: 200,
  [DroneModel.MIDDLEWEIGHT]: 300,
  [DroneModel.CRUISERWEIGHT]: 400,
  [DroneModel.HEAVYWEIGHT]: 500,
};
