/**
 * This module handles socket.io connections.
 * @param io
 */
module.exports = (io) => {
    io.on('connection', (socket) => {
        console.log('A user connected');

        socket.on('chat message', (room, msg) => {
            socket.to(room).emit('chat message', room, msg);
        });

        socket.on('join conversation', (name, room) => {
            socket.join(room);
            socket.name = name; // Memorizza il nome sul socket per uso futuro
            io.to(room).emit('join conversation', name, room);
        });

        socket.on('leave conversation', (name, room) => {
            socket.leave(room);
            io.to(room).emit('leave conversation', name, room);
        });

        socket.on('disconnect', () => {
            try {
                if(socket.name) {
                    io.emit("leave conversation", socket.name);
                }
                console.log('A user disconnected');
            } catch(e) {
                console.log("Errore durante la disconnessione: ", e);
            }
        });
    });
};
