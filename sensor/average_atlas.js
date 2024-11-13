const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI;
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
    console.time("Aggregate time");

    try {
        const results = await collection
            .aggregate(
                [
                    {
                      '$match': {
                        'timestamp': {
                          '$lt': new Date('Sun, 20 Jun 2021 00:00:00 GMT')
                        }
                      }
                    }, {
                      '$group': {
                        '_id': '$type', 
                        'avg': {
                          '$avg': '$value'
                        }
                      }
                    }
                  ]
            ).toArray();

            results.forEach(result => {
                const type = result._id;
                const units = type === 'temperature' ? '\u00B0C' : '%';
                console.log(`Average ${type}: ${result.avg.toFixed(2)}${units}`);
            });
    } 
    catch (error) 
    {
        console.log(error.message);
    } 
    finally 
    {
        client.close();
        console.timeEnd("Aggregate time");
    }
}

startQuery();
