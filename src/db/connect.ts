import { connect } from "mongoose";

const connectDB = async () => {
  try {
    await connect(process.env.MONGO_DB_URL!, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      useFindAndModify: false,
      keepAlive: true,
      connectTimeoutMS: 60000,
      socketTimeoutMS: 60000,
    });
    console.log("[INITIALIZE] : Connection to the database established successfully");
  } catch (err) {
    console.log("[INITIALIZE] : Could not connect to the database due to : ", err);
  }
};

connectDB()
