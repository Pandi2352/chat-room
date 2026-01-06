
const mongoose = require('mongoose');

async function test() {
    try {
        await mongoose.connect('mongodb+srv://mvpbose52_db_user:pWcTA7UafPT651VZ@cluster0.oezpyhs.mongodb.net/chat-app?appName=Cluster0');
        console.log('Connected');

        const rooms = await mongoose.connection.db.collection('rooms').find().toArray();
        console.log('Rooms found:', rooms.length);
        
        if (rooms.length > 0) {
            console.log('First Room:', JSON.stringify(rooms[0], null, 2));
            
            // Check participants type
            const p1 = rooms[0].participants[0];
            console.log('Participant 1 type:', typeof p1, 'Value:', p1);

            // try to fetch that user
            const u1 = await mongoose.connection.db.collection('users').findOne({ _id: new mongoose.Types.ObjectId(p1) });
             console.log('User 1 found:', !!u1, u1 ? u1.displayName : 'N/A');
        }

    } catch (e) {
        console.error(e);
    } finally {
        await mongoose.disconnect();
    }
}
test();
