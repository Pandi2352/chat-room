
export const getOtherParticipant = (room: any, currentUserId?: string) => {
    if (room.type === 'private') {
        const other = room.participants.find((p: any) => p._id !== currentUserId);
        return other || null;
    }
    return null;
};

export const getRoomName = (room: any, currentUserId?: string) => {
    const other = getOtherParticipant(room, currentUserId);
    return other?.displayName || room.name || 'Unknown User';
};

export const getRoomAvatar = (room: any, currentUserId?: string) => {
    const other = getOtherParticipant(room, currentUserId);
    return other?.displayName?.[0] || '?';
};

export const isUserOnline = (userId: string, onlineUsers: Set<string>) => {
    return onlineUsers.has(userId);
};
