# Drone Dispatch Service

A REST API service for managing drone medication deliveries built with Nodejs and TypeScript.

## Prerequisites

- Node.js (v18+)
- npm or yarn

## Installation

```bash
# Install dependencies
npm install
# or
yarn install
```

## Running the Application

```bash
# Development mode
npm run start:dev
# or
yarn start:dev
```

## Using Docker
# Build and run the container

```bash
docker-compose up --build -d

# View logs
docker-compose logs -f

# Stop container
docker-compose down
```


The API will be available at `http://localhost:3000/api`

## Testing

```bash
# Run unit tests
npm test
# or
yarn test

# Test coverage
npm run test:cov
```

### Run a specific test by name

```bash
yarn test --testNamePattern="weight exceeds limit"
```

## Load Postman Collection
You can use Postman to quickly test the Drone Dispatch Service API.

Steps:
- Open Postman.
- Click Import in the top-left corner.
- Select File and choose the provided Postman collection JSON file.
- Click Import.
- Once imported, you will see a folder with all API requests.
- Update the environment variable or URLs if needed, e.g., http://localhost:3000/api.
- Run requests individually or use Collection Runner to test all endpoints.


## API Endpoints

### Register a Drone
```bash
POST /api/drones
Content-Type: application/json

{
  "serialNumber": "DRONE-011",
  "model": "Lightweight",
  "weightLimit": 200,
  "batteryCapacity": 100
}
```

### Load Drone with Medications
```bash
POST /api/drones/:serialNumber/load
Content-Type: application/json

{
  "medications": [
    {
      "name": "Aspirin-500mg",
      "weight": 50,
      "code": "ASP_500",
      "image": "https://example.com/aspirin.jpg"
    }
  ]
}
```

### Get Available Drones
```bash
GET /api/drones/available
```

### Check Loaded Medications
```bash
GET /api/drones/:serialNumber/medications
```

### Check Battery Level
```bash
GET /api/drones/:serialNumber/battery
```

### Get All Drones
```bash
GET /api/drones
```

## Business Rules

- Drone models: Lightweight (200g), Middleweight (300g), Cruiserweight (400g), Heavyweight (500g)
- Battery must be ≥25% to load medications
- Total weight cannot exceed drone's weight limit
- Medication names: only letters, numbers, `-`, `_`
- Medication codes: only uppercase letters, numbers, `_`

## Features

- ✅ Register and manage drones
- ✅ Load medications with weight validation
- ✅ Battery level monitoring (prevents loading below 25%)
- ✅ Automatic battery audit logging every 5 minutes
- ✅ Check available drones
- ✅ Pre-loaded test data (10 drones)

## Database

Uses SQLite in-memory database with 10 pre-loaded drones for testing.

## Project Structure

```
src/modules
├── drones/           # Drone management
├── medications/      # Medication entities
├── battery-audit/    # Battery monitoring
├── database/seeds/   # Test data seeder
src/
└── common/           # Shared enums and exceptions
```

## Example Test

```bash
# Load a drone
curl -X POST http://localhost:3000/api/drones/DRONE-002/load \
  -H "Content-Type: application/json" \
  -d '{
    "medications": [{
      "name": "Aspirin",
      "weight": 50,
      "code": "ASP_500",
      "image": "https://example.com/aspirin.jpg"
    }]
  }'
```
