import { MongoClient } from "mongodb"; // or const { MongoClient } = require("mongodb"); for CommonJS

const client = new MongoClient("mongodb+srv://theemeraldprogamer_db_user:SuiynRGzrKFp8HZF@cluster0.xhs7aj1.mongodb.net");

async function run() {
  try {
    await client.connect();
    const result = await client.db("admin").command({ replSetGetStatus: 1 });
    console.log("Replica Set Name:", result.set);
  } catch (e) {
    console.error(e);
  } finally {
    await client.close();
  }
}

run();
