
namespace A
{
	export const enum ContentType { Text = 0, Reply = 1, Image = 2, CreateChannel = 3, JoinChannel = 4, LeaveChannel = 5 }
	export interface MessageDto
	{
		Id: number;
		TimeStamp: string;
		ReferenceTo: number; // 0: normal message, +: update, -: delete
		SenderId: string;
		ContentType: ContentType;
		Content: string;
	}

	export interface UserDto
	{
		Id: string;
		DisplayName: string;
		LastSeen: string;
	}

	export const enum ConversationState { Disconnected, OutgoingRequest, IncomingRequest, Accepted, Group }
	export const enum ConversationAccess { NoAccess, CanRead, CanWrite, Admin }
	export const enum NotificationLevel { None, Gray, Push }
	export interface ConversationDto
	{
		ChannelId: string;
		ParentChannelId: string;
		Name: string;
		Description: string;
		Data: string;
		State: ConversationState;
		Access: ConversationAccess;
		NotificationLevel: NotificationLevel;
		UnreadCount: number;
		MemberIds: string[];
		LastMessages: MessageDto[];
	}

	export interface InboxDto
	{
		User: UserDto;
		Contacts: UserDto[];
		Conversations: ConversationDto[];
	}

	export interface LoginResult
	{
		QueryToken: string;
		LoginToken: string;
		Inbox: InboxDto;
	}

	export const enum NotificationType { Message = 0, ConversationAdded = 1, ConversationRemoved = 2, User = 3, List = 4 }
	export type Notification =
		{ Notification: NotificationType.Message, ChannelId: string, Message: MessageDto } |
		{ Notification: NotificationType.ConversationAdded, Conversation: ConversationDto } |
		{ Notification: NotificationType.ConversationRemoved, ChannelId: string } |
		{ Notification: NotificationType.User, User: UserDto } |
		{ Notification: NotificationType.List, Notifications: Notification[] };

}
