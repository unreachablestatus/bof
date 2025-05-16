// WebSocket Server for Blooom Chat
const { createServer } = require('http');
const { Server } = require('socket.io');
const express = require('express');
const { PrismaClient } = require('./src/generated/prisma');

// Environment variables
require('dotenv').config();

const app = express();
const server = createServer(app);

// Get allowed origins from environment or use defaults
const allowedOrigins = process.env.CORS_ALLOWED_ORIGINS
  ? process.env.CORS_ALLOWED_ORIGINS.split(',')
  : ['http://localhost:3000', 'https://same-f5la0pteesn-latest.netlify.app'];

console.log('WebSocket server allowed origins:', allowedOrigins);

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  }
});

// Prisma client
const prisma = new PrismaClient();

// Online users tracking
const onlineUsers = new Map();

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('New client connected:', socket.id);

  // User connects with authentication
  socket.on('authenticate', async (userId) => {
    try {
      // Mark the user as online with socket id
      onlineUsers.set(parseInt(userId), socket.id);

      console.log(`User ${userId} authenticated and is now online`);

      // Send online status to all connected clients
      io.emit('user_status', {
        userId: parseInt(userId),
        status: 'online'
      });

      // Load recent messages for this user
      try {
        const messages = await prisma.chatMessage.findMany({
          where: {
            OR: [
              { senderId: parseInt(userId) },
              { receiverId: parseInt(userId) }
            ]
          },
          orderBy: {
            timestamp: 'asc'
          },
          include: {
            sender: {
              select: {
                id: true,
                username: true
              }
            },
            receiver: {
              select: {
                id: true,
                username: true
              }
            }
          },
          take: 50 // Last 50 messages
        });

        // Send recent messages to the user
        socket.emit('recent_messages', messages);
      } catch (error) {
        console.error('Error loading recent messages:', error);
      }
    } catch (error) {
      console.error('Authentication error:', error);
    }
  });

  // User starts typing
  socket.on('typing', (data) => {
    const { userId, receiverId } = data;

    // Get receiver's socket ID
    const receiverSocketId = onlineUsers.get(parseInt(receiverId));

    if (receiverSocketId) {
      // Notify the receiver that the sender is typing
      io.to(receiverSocketId).emit('user_typing', { userId });
    }
  });

  // User stops typing
  socket.on('stop_typing', (data) => {
    const { userId, receiverId } = data;

    // Get receiver's socket ID
    const receiverSocketId = onlineUsers.get(parseInt(receiverId));

    if (receiverSocketId) {
      // Notify the receiver that the sender stopped typing
      io.to(receiverSocketId).emit('user_stop_typing', { userId });
    }
  });

  // New chat message
  socket.on('new_message', async (data) => {
    try {
      const { content, senderId, receiverId } = data;

      if (!content || !senderId || !receiverId) {
        return socket.emit('error', { message: 'Invalid message data' });
      }

      // Store the message in the database
      const message = await prisma.chatMessage.create({
        data: {
          content,
          senderId: parseInt(senderId),
          receiverId: parseInt(receiverId)
        },
        include: {
          sender: {
            select: {
              id: true,
              username: true
            }
          },
          receiver: {
            select: {
              id: true,
              username: true
            }
          }
        }
      });

      // Send the message to the sender
      socket.emit('message_sent', message);

      // Send the message to the receiver if they're online
      const receiverSocketId = onlineUsers.get(parseInt(receiverId));

      if (receiverSocketId) {
        io.to(receiverSocketId).emit('new_message', message);
      }
    } catch (error) {
      console.error('Error saving message:', error);
      socket.emit('error', { message: 'Failed to send message' });
    }
  });

  // User disconnects
  socket.on('disconnect', () => {
    // Find the disconnected user
    for (const [userId, socketId] of onlineUsers.entries()) {
      if (socketId === socket.id) {
        // Remove from online users
        onlineUsers.delete(userId);

        // Notify all clients that this user is offline
        io.emit('user_status', {
          userId,
          status: 'offline'
        });

        console.log(`User ${userId} disconnected and is now offline`);
        break;
      }
    }
  });
});

// Basic API endpoint for health check
app.get('/', (req, res) => {
  res.json({ status: 'ok', service: 'Blooom Chat WebSocket Server' });
});

// Start the server
const PORT = process.env.WS_PORT || 4000;
server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
});
