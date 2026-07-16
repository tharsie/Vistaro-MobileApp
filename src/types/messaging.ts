export interface MessageResponseDto {
  id: string;
  senderUserId: string;
  receiverUserId: string;
  studentProfileId: string;
  shopOwnerProfileId: string;
  relatedJobPostingId: string | null;
  messageText: string;
  messageType: 1 | 2;
  invitationStatus: 1 | 2 | 3 | 4;
  isRead: boolean;
  createdAt: string;
  studentFullName: string;
  shopName: string;
  relatedJobTitle: string | null;
  jobApplicationId: string | null;
  moderationStatus: 1 | 2 | 3 | null;
}

export interface SendMessageDto {
  studentProfileId: string;
  shopOwnerProfileId?: string | null;
  messageText: string;
  messageType: 1 | 2;
  jobApplicationId: string;
}

export interface ConversationThread {
  jobApplicationId: string;
  jobTitle: string | null;
  otherPartyName: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
  messages: MessageResponseDto[];
}
