import { MongoClient } from 'mongodb';

export const GET = async (req: Request) => {
  const uri = process.env.MONGODB_URL;
  console.log(uri)

  if (!uri) {
    return new Response(
      JSON.stringify({ message: "MongoDB URI is not defined" }),
      { status: 500 }
    );
  }

  try {
    // Create a new MongoDB client and connect
    const client = new MongoClient(uri);
    await client.connect();

    // Fetch collections from the database (optional)
    const db = client.db();
    const collections = await db.listCollections().toArray();

    // Close the connection
    await client.close();

    return new Response(
      JSON.stringify({
        message: "Connected to MongoDB successfully!",
        collections: collections.map((col) => col.name),
      }),
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof Error) {
      console.error("MongoDB Connection Error:", error.message);
      return new Response(
        JSON.stringify({
          message: "Failed to connect to MongoDB",
          error: error.message,
        }),
        { status: 500 }
      );
    }
    return new Response(
      JSON.stringify({ message: "An unknown error occurred" }),
      { status: 500 }
    );
  }
};
