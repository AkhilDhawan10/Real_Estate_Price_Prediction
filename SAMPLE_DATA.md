# Sample Data Guide

This document provides examples of data formats and sample data for testing the application.

## Sample PDF Format

The PDF parser expects property data in a structured format. Here's an example:

```
Property Listing - October 2023

City: Mumbai, Area: Bandra, Type: flat, Size: 1200 sqft, Price: 5000000
City: Delhi, Area: Connaught Place, Type: plot, Size: 500 gaj, Price: 10000000
City: Bangalore, Area: Koramangala, Type: flat, Size: 1500 sqft, Price: 7500000
City: Mumbai, Area: Andheri, Type: flat, Size: 1000 sqft, Price: 4000000
City: Pune, Area: Hinjewadi, Type: plot, Size: 800 gaj, Price: 6000000
```

## Sample User Data

### Registration
```json
{
  "fullName": "John Doe",
  "phoneNumber": "9876543210",
  "email": "john@example.com",
  "password": "password123"
}
```

## Sample Property Search

### Search Request
```
GET /api/properties/search?city=Mumbai&area=Bandra&propertyType=flat&sizeMin=1000&sizeMax=1500&sizeUnit=sqft&budgetMin=4000000&budgetMax=6000000
```

### Search Response
```json
{
  "properties": [
    {
      "_id": "...",
      "location": {
        "city": "mumbai",
        "area": "bandra"
      },
      "propertyType": "flat",
      "size": {
        "value": 1200,
        "unit": "sqft"
      },
      "price": 5000000,
      "brokerNotes": "Prime location, ready to move",
      "createdAt": "2023-10-01T00:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 1,
    "pages": 1
  }
}
```

## Sample Subscription Plans

### Monthly Plan
```json
{
  "type": "monthly",
  "name": "Monthly Plan",
  "price": 999,
  "duration": "1 month",
  "features": [
    "Access to all properties",
    "Monthly updates",
    "Email support"
  ]
}
```

### Quarterly Plan
```json
{
  "type": "quarterly",
  "name": "Quarterly Plan",
  "price": 2499,
  "duration": "3 months",
  "savings": 498,
  "features": [
    "Access to all properties",
    "Monthly updates",
    "Priority support",
    "Save ₹498"
  ]
}
```

## Sample Excel Output

### users.xlsx
| Full Name | Phone Number | Email | Created At |
|-----------|--------------|-------|------------|
| John Doe | 9876543210 | john@example.com | 2023-10-01T00:00:00.000Z |

### properties.xlsx
| City | Area | Property Type | Size Value | Size Unit | Price | Broker Notes |
|------|------|---------------|------------|-----------|-------|--------------|
| mumbai | bandra | flat | 1200 | sqft | 5000000 | Prime location |

## Testing Scenarios

### 1. User Registration Flow
1. Register with valid data
2. Check if user is saved to MongoDB
3. Check if user is appended to users.xlsx
4. Verify JWT token is returned

### 2. Subscription Flow
1. Login as registered user
2. View available plans
3. Create payment order
4. Complete Razorpay payment (use test mode)
5. Verify payment
6. Check subscription status

### 3. Property Search Flow
1. Login with active subscription
2. Search with filters
3. Verify results are returned
4. Check relevance scoring

### 4. Admin PDF Upload Flow
1. Login as admin
2. Upload sample PDF
3. Verify properties are extracted
4. Check MongoDB for new properties
5. Check properties.xlsx is updated

## Test Credentials

### Admin User
- Email: admin@propertybroker.com
- Password: admin123 (change in production!)

### Test Broker User
- Email: test@example.com
- Password: test123

## Razorpay Test Mode

For testing payments, use Razorpay test mode:
- Test Key ID: Available in Razorpay dashboard
- Test Key Secret: Available in Razorpay dashboard
- Test Cards: Use Razorpay test card numbers

## Creating Sample PDF

You can create a sample PDF with property data using any PDF generator. The parser looks for:
- City and Area keywords
- Property type (plot/flat)
- Size with unit (sqft/gaj)
- Price/Amount keywords
- Notes/Remarks

Example text format:
```
City: Mumbai
Area: Bandra
Type: Flat
Size: 1200 sqft
Price: ₹50,00,000
Notes: Prime location, ready to move
```

