const generateMeetingLink = (appointmentId) => {
  const roomName = `healthcare-appointment-${appointmentId}-${Date.now()}`;
  return `https://meet.jit.si/${roomName}`;
};

module.exports = generateMeetingLink;