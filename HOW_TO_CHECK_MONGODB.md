# How to Check MongoDB

## Method 1: Using MongoDB Compass (GUI - Easiest)

1. **Download MongoDB Compass** (if not installed):
   - Visit: https://www.mongodb.com/try/download/compass
   - Install for your OS

2. **Connect:**
   - Open MongoDB Compass
   - Connection string: `mongodb://localhost:27017`
   - Click "Connect"

3. **View Your Data:**
   - Database: `property-broker`
   - Collections:
     - `properties` - Your 1180 properties
     - `users` - All users
     - `subscriptions` - All subscriptions
     - `propertyrequirements` - Search history

4. **Browse Properties:**
   - Click on `properties` collection
   - You'll see all documents
   - Click any document to view details

## Method 2: Using mongosh (Command Line)

```bash
# Open MongoDB shell
mongosh

# Show all databases
show dbs

# Use your database
use property-broker

# Count documents
db.properties.countDocuments()
# Output: 1180

# See first 5 properties
db.properties.find().limit(5).pretty()

# Find properties in a specific area
db.properties.find({ "location.area": "anand lok" }).limit(3).pretty()

# Count by property type
db.properties.countDocuments({ propertyType: "flat" })
db.properties.countDocuments({ propertyType: "plot" })

# Find properties with bedrooms
db.properties.find({ bedrooms: { $exists: true } }).limit(3).pretty()

# Find properties without price
db.properties.countDocuments({ price: { $exists: false } })

# Get unique areas
db.properties.distinct("location.area")

# Exit
exit
```

## Method 3: Using VS Code Extension

1. Install extension: "MongoDB for VS Code"
2. Click MongoDB icon in sidebar
3. Connect to `mongodb://localhost:27017`
4. Browse collections visually

## Quick Health Check Commands

```bash
# Is MongoDB running?
sudo systemctl status mongod

# Start MongoDB
sudo systemctl start mongod

# Check which databases exist
mongosh --eval "show dbs"

# Count properties
mongosh property-broker --eval "db.properties.countDocuments()"
```

## Common Queries for Debugging

```javascript
// In mongosh:

// Check if properties have size field
db.properties.countDocuments({ "size.value": { $exists: true } })

// Check distribution of units
db.properties.aggregate([
  { $group: { _id: "$size.unit", count: { $sum: 1 } } }
])

// Check how many properties have each field
db.properties.countDocuments({ bedrooms: { $exists: true } })
db.properties.countDocuments({ price: { $exists: true } })
db.properties.countDocuments({ floors: { $exists: true } })
db.properties.countDocuments({ status: { $exists: true } })

// Sample properties to see actual data
db.properties.findOne()
```
