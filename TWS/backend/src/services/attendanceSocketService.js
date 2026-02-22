const { Server } = require('socket.io');

class AttendanceSocketService {
  constructor(io) {
    this.io = io;
    this.setupSocketHandlers();
  }

  setupSocketHandlers() {
    this.io.on('connection', (socket) => {
      console.log('User connected to attendance socket:', socket.id);

      // Handle employee check-in
      socket.on('attendanceCheckIn', async (data) => {
        try {
          console.log('Employee check-in received:', data);
          
          // Broadcast to admin panel
          this.io.emit('adminAttendanceUpdate', {
            type: 'checkIn',
            userId: data.userId,
            employeeId: data.employeeId,
            timestamp: data.timestamp,
            location: data.location,
            workMode: data.workMode,
            currentProject: data.currentProject,
            message: `Employee ${data.employeeId} checked in at ${new Date(data.timestamp).toLocaleTimeString()}`
          });

          // Notify team members
          this.io.emit('teamActivityUpdate', {
            type: 'checkIn',
            userId: data.userId,
            employeeId: data.employeeId,
            timestamp: data.timestamp,
            workMode: data.workMode,
            currentProject: data.currentProject
          });

        } catch (error) {
          console.error('Error handling check-in:', error);
          socket.emit('error', { message: 'Failed to process check-in' });
        }
      });

      // Handle employee check-out
      socket.on('attendanceCheckOut', async (data) => {
        try {
          console.log('Employee check-out received:', data);
          
          // Broadcast to admin panel
          this.io.emit('adminAttendanceUpdate', {
            type: 'checkOut',
            userId: data.userId,
            employeeId: data.employeeId,
            timestamp: data.timestamp,
            location: data.location,
            message: `Employee ${data.employeeId} checked out at ${new Date(data.timestamp).toLocaleTimeString()}`
          });

          // Notify team members
          this.io.emit('teamActivityUpdate', {
            type: 'checkOut',
            userId: data.userId,
            employeeId: data.employeeId,
            timestamp: data.timestamp
          });

        } catch (error) {
          console.error('Error handling check-out:', error);
          socket.emit('error', { message: 'Failed to process check-out' });
        }
      });

      // Handle break start/end
      socket.on('attendanceBreakUpdate', async (data) => {
        try {
          console.log('Break update received:', data);
          
          this.io.emit('teamActivityUpdate', {
            type: data.action, // 'breakStart' or 'breakEnd'
            userId: data.userId,
            employeeId: data.employeeId,
            timestamp: data.timestamp,
            duration: data.duration
          });

        } catch (error) {
          console.error('Error handling break update:', error);
          socket.emit('error', { message: 'Failed to process break update' });
        }
      });

      // Handle focus mode toggle
      socket.on('focusModeToggle', async (data) => {
        try {
          console.log('Focus mode toggle received:', data);
          
          this.io.emit('teamActivityUpdate', {
            type: 'focusMode',
            userId: data.userId,
            employeeId: data.employeeId,
            enabled: data.enabled,
            timestamp: data.timestamp
          });

        } catch (error) {
          console.error('Error handling focus mode toggle:', error);
          socket.emit('error', { message: 'Failed to process focus mode toggle' });
        }
      });

      // Handle admin notifications
      socket.on('adminNotification', (data) => {
        try {
          console.log('Admin notification sent:', data);
          
          // Send to specific user if userId is provided
          if (data.userId) {
            this.io.to(data.userId).emit('adminNotification', data);
          } else {
            // Broadcast to all connected users
            this.io.emit('adminNotification', data);
          }

        } catch (error) {
          console.error('Error sending admin notification:', error);
        }
      });

      // Handle admin attendance approval/rejection
      socket.on('adminAttendanceAction', async (data) => {
        try {
          console.log('Admin attendance action received:', data);
          
          // Notify the specific employee
          this.io.to(data.userId).emit('attendanceAction', {
            type: data.action, // 'approved', 'rejected', 'modified'
            attendanceId: data.attendanceId,
            message: data.message,
            timestamp: new Date()
          });

        } catch (error) {
          console.error('Error handling admin attendance action:', error);
          socket.emit('error', { message: 'Failed to process attendance action' });
        }
      });

      // Handle real-time attendance monitoring
      socket.on('joinAttendanceMonitoring', (data) => {
        try {
          console.log('User joined attendance monitoring:', data);
          
          // Join specific room for attendance monitoring
          socket.join('attendance-monitoring');
          
          // Send current attendance status
          socket.emit('attendanceStatusUpdate', {
            type: 'initial',
            message: 'Connected to attendance monitoring'
          });

        } catch (error) {
          console.error('Error joining attendance monitoring:', error);
          socket.emit('error', { message: 'Failed to join attendance monitoring' });
        }
      });

      // Handle team activity monitoring
      socket.on('joinTeamActivity', (data) => {
        try {
          console.log('User joined team activity monitoring:', data);
          
          // Join team activity room
          socket.join('team-activity');
          
          socket.emit('teamActivityStatus', {
            type: 'initial',
            message: 'Connected to team activity monitoring'
          });

        } catch (error) {
          console.error('Error joining team activity:', error);
          socket.emit('error', { message: 'Failed to join team activity monitoring' });
        }
      });

      // Handle disconnect
      socket.on('disconnect', () => {
        console.log('User disconnected from attendance socket:', socket.id);
      });
    });
  }

  // Method to broadcast attendance updates to all connected clients
  broadcastAttendanceUpdate(updateData) {
    this.io.emit('attendanceUpdate', updateData);
  }

  // Method to send notification to specific user
  sendNotificationToUser(userId, notification) {
    this.io.to(userId).emit('notification', notification);
  }

  // Method to broadcast team activity updates
  broadcastTeamActivity(activityData) {
    this.io.to('team-activity').emit('teamActivityUpdate', activityData);
  }

  // Method to broadcast admin updates
  broadcastAdminUpdate(adminData) {
    this.io.to('attendance-monitoring').emit('adminAttendanceUpdate', adminData);
  }
}

module.exports = AttendanceSocketService;
