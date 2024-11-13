const { MongoClient } = require('mongodb');

const url = 'mongodb://localhost:27017';
const dbName = 'my-sensors';
const collectionName = 'data';
const options = {
    serverSelectionTimeoutMS: 3000,
    connectTimeoutMS: 3000,
    socketTimeoutMS: 3000
};
const sensorType = 'humidity';

async function startQuery() {
    let client;
    console.time("Connect time");

    try {
        client = await MongoClient.connect(url, options);
    } catch (error) {
        console.log(`Timeout: \n${error.message}`);
        return;
    } finally {
        console.timeEnd("Connect time");
    }

    const collection = client.db(dbName).collection(collectionName);
    console.time("Find time");

    try {
        const results = await collection
            .find(
                {
                    type: sensorType,
                    timestamp: { $lt: new Date('2021-06-15') }
                },
                {
                    projection: { _id: 0, value: 1, sensorId: 1 }
                }
            )
            .sort({ sensorId: 1 })
            .toArray();

        const units = sensorType === 'temperature' ? '\u00B0C' : '%';
        
        results.forEach(result => {
            const id = result.sensorId;
            const value = result.value;
            console.log(`Sensor ${id}: ${sensorType} ${value}${units}`);
        });

    } catch (error) {
        console.log(error.message);
    } finally {
        client.close(); 
        console.timeEnd("Find time");
    }
}

startQuery();
