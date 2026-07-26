import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { ArrowRightCircle, Edit2, Send, Trash2, X} from 'lucide-react-native';

import {CHAT_API_ENDPOINTS} from '../../constants/api.consts';
import {useAuth} from '../../context/Auth';
import {useChat} from '../../context/Chat';
import styleVars from '../../style.vars';
import { useNav } from '../../context/Pages';
import getCustomHeader from '../../utils/get-custom-header.utils';

type Message = {
  id: string;
  content: string;
  phoneNumber: string;
  room_id: string;
  createdAt: string;
};

type MessageRow =
  | {key: string; type: 'date'; label: string}
  | {key: string; type: 'message'; message: Message};

type SocketMessage =
  | {type: 'new'; message: Message}
  | {type: 'delete'; id: string}
  | {type: 'update'; id?: string; message?: Message; content?: string};

const formatDateLabel = (value: string) => {
  const date = new Date(value);
  const today = new Date();
  const startOfToday = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  );
  const startOfDate = new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate(),
  );
  const daysAgo = Math.floor(
    (startOfToday.getTime() - startOfDate.getTime()) / 86_400_000,
  );

  if (daysAgo === 0) {
    return 'امروز';
  }
  if (daysAgo > 0 && daysAgo < 7) {
    return `${daysAgo.toLocaleString('fa-IR')} روز پیش`;
  }
  return date.toLocaleDateString('fa-IR');
};

const formatTime = (value: string) =>
  new Date(value).toLocaleTimeString('fa-IR', {
    hour: '2-digit',
    minute: '2-digit',
  });

export default function ChatRoom() {
  const {connection, currentRoom , setCurrentRoom , user} = useChat();
  const auth = useAuth();
  const listRef = useRef<FlatList<MessageRow>>(null);
  const inputRef = useRef<TextInput>(null);
  const selectedMessageRef = useRef<Message | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageContent, setMessageContent] = useState('');
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const {replace} = useNav();

  const roomId = currentRoom?.id;
  const phoneNumber = auth.userInfo?.phone_number;
  const isAdmin = Boolean(user?.isAdmin || auth.userInfo?.is_admin);

  useEffect(() => {
    selectedMessageRef.current = selectedMessage;
  }, [selectedMessage]);

  const otherParticipant = useMemo(
    () =>
      messages.find(message => message.phoneNumber !== phoneNumber)
        ?.phoneNumber ?? null,
    [messages, phoneNumber],
  );

  const rows = useMemo<MessageRow[]>(() => {
    const result: MessageRow[] = [];
    let previousDate = '';

    messages.forEach(message => {
      const date = new Date(message.createdAt).toDateString();
      if (date !== previousDate) {
        result.push({
          key: `date-${date}`,
          type: 'date',
          label: formatDateLabel(message.createdAt),
        });
        previousDate = date;
      }
      result.push({
        key: `message-${message.id}`,
        type: 'message',
        message,
      });
    });

    return result;
  }, [messages]);

  const cancelEdit = useCallback(() => {
    setSelectedMessage(null);
    setMessageContent('');
    inputRef.current?.clear();
  }, []);

  useEffect(() => {
    let cancelled = false;

    setMessages([]);
    cancelEdit();
    if (!roomId) {
      return;
    }

    const getMessages = async () => {
      setIsLoading(true);
      try {
        const query = new URLSearchParams({roomId});
        const response = await fetch(
          `${CHAT_API_ENDPOINTS.MESSAGES}?${query.toString()}`,
          {
            headers:getCustomHeader(),
          }
        );
        if (response.ok && !cancelled) {
          const roomMessages: Message[] = await response.json();
          setMessages(roomMessages);
        }
      } catch (error) {
        console.warn(
          'Could not load chat messages:',
          error instanceof Error ? error.message : error,
        );
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    getMessages();
    return () => {
      cancelled = true;
    };
  }, [cancelEdit, roomId]);

  useEffect(() => {
    if (!connection) {
      return;
    }

    const handleSocketMessage = (event: WebSocketMessageEvent) => {
      try {
        const data: SocketMessage = JSON.parse(String(event.data));

        if (data.type === 'new') {
          if (data.message.room_id !== roomId) {
            return;
          }
          setMessages(current => [...current, data.message]);
          setMessageContent('');
          inputRef.current?.clear();
          return;
        }

        if (data.type === 'delete') {
          setMessages(current =>
            current.filter(message => message.id !== data.id),
          );
          if (selectedMessageRef.current?.id === data.id) {
            cancelEdit();
          }
          return;
        }

        if (data.type === 'update') {
          const edited = data.message ?? selectedMessageRef.current;
          const editedId = data.message?.id ?? data.id ?? edited?.id;
          if (!editedId) {
            return;
          }
          setMessages(current =>
            current.map(message =>
              message.id === editedId
                ? {
                    ...message,
                    ...(data.message ?? {}),
                    content:
                      data.message?.content ??
                      data.content ??
                      selectedMessageRef.current?.content ??
                      message.content,
                  }
                : message,
            ),
          );
          cancelEdit();
        }
      } catch (error) {
        console.warn(
          'Could not read chat event:',
          error instanceof Error ? error.message : error,
        );
      }
    };

    connection.addEventListener('message', handleSocketMessage);
    return () => {
      connection.removeEventListener('message', handleSocketMessage);
    };
  }, [cancelEdit, connection, roomId]);

  const sendSocketPayload = useCallback(
    (payload: object) => {
      if (!connection || connection.readyState !== WebSocket.OPEN) {
        return false;
      }
      connection.send(JSON.stringify(payload));
      return true;
    },
    [connection],
  );

  const handleSend = useCallback(() => {
    const content = messageContent.trim();
    if (!content || !phoneNumber || !roomId) {
      return;
    }

    if (selectedMessage) {
      selectedMessageRef.current = {...selectedMessage, content};
      sendSocketPayload({
        type: 'update',
        content,
        messageId: selectedMessage.id,
        phoneNumber,
      });
      return;
    }

    sendSocketPayload({
      type: 'message',
      content,
      phoneNumber,
      roomId,
      to: otherParticipant,
    });
  }, [
    messageContent,
    otherParticipant,
    phoneNumber,
    roomId,
    selectedMessage,
    sendSocketPayload,
  ]);

  const handleDelete = useCallback(
    (message: Message) => {
      if (!phoneNumber) {
        return;
      }
      sendSocketPayload({
        type: 'delete',
        messageId: message.id,
        phoneNumber,
      });
    },
    [phoneNumber, sendSocketPayload],
  );

  const handleEdit = useCallback((message: Message) => {
    setSelectedMessage(message);
    setMessageContent(message.content);
    inputRef.current?.setNativeProps({text: message.content});
    inputRef.current?.focus();
  }, []);

  const renderRow = useCallback(
    ({item}: {item: MessageRow}) => {
      if (item.type === 'date') {
        return (
          <View style={styles.dateBadge}>
            <Text style={styles.dateText}>{item.label}</Text>
          </View>
        );
      }

      const message = item.message;
      const isMine = message.phoneNumber === phoneNumber;
      return (
        <View
          style={[
            styles.message,
            isMine ? styles.myMessage : styles.otherMessage,
          ]}>
          <View
            style={[
              styles.messageBubble,
              isMine ? styles.myBubble : styles.otherBubble,
            ]}>
            <Text style={[styles.messageText, isMine && styles.myMessageText]}>
              {message.content}
            </Text>
          </View>
          <View style={styles.messageInfo}>
            <Text style={styles.timeText}>{formatTime(message.createdAt)}</Text>
            {isAdmin ? (
              <View style={styles.messageActions}>
                <Pressable
                  accessibilityLabel="اصلاح پیام"
                  hitSlop={8}
                  onPress={() => handleEdit(message)}>
                  <Edit2 color="#666" size={17} />
                </Pressable>
                <Pressable
                  accessibilityLabel="حذف پیام"
                  hitSlop={8}
                  onPress={() => handleDelete(message)}>
                  <Trash2 color="#666" size={17} />
                </Pressable>
              </View>
            ) : null}
          </View>
        </View>
      );
    },
    [handleDelete, handleEdit, isAdmin, phoneNumber],
  );

  useEffect(() => {
    if (!currentRoom) {
      replace('/rooms');
    }
  }, [currentRoom, replace]);

  if (!currentRoom) {
    return null;
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={styles.container}>
      {isLoading ? (
        <View style={styles.emptyContainer}>
          <ActivityIndicator color="#4f8f19" />
        </View>
      ) : (
        <>
        <View style={{flexDirection:"row" , justifyContent:"space-between" , alignItems:"center" , paddingHorizontal:styleVars.horizontalSpacing}}>
            <Text style={{fontWeight:'bold' , fontSize:18 , alignSelf:"center"}}>{currentRoom.name}</Text>
            <Pressable onPress={() => {
                replace("/rooms")
                setCurrentRoom(() => null)
            }}>
                <ArrowRightCircle size={25} />
            </Pressable>
        </View>
        <FlatList
          contentContainerStyle={[
            styles.listContent,
            rows.length === 0 && styles.emptyList,
          ]}
          data={rows}
          keyExtractor={item => item.key}
          ListEmptyComponent={
            <Text style={styles.emptyText}>شما پیامی ندارید</Text>
          }
          onContentSizeChange={() =>
            listRef.current?.scrollToEnd({animated: true})
          }
          ref={listRef}
          renderItem={renderRow}
        />
        </>
      )}

      <View style={styles.inputHolder}>
        {selectedMessage ? (
          <View style={styles.editPreview}>
            <View style={styles.editPreviewContent}>
              <Text style={styles.editTitle}>در حال ویرایش پیام</Text>
              <Text numberOfLines={1} style={styles.editText}>
                {selectedMessage.content}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="لغو ویرایش پیام"
              hitSlop={8}
              onPress={cancelEdit}
              style={styles.cancelButton}>
              <X color="#666" size={20} />
            </Pressable>
          </View>
        ) : null}

        <View style={styles.chatInput}>
          <TextInput
            multiline
            onChangeText={setMessageContent}
            onSubmitEditing={handleSend}
            placeholder="پیام خود را بنویسید"
            ref={inputRef}
            style={styles.input}
            textAlign="right"
          />
          <Pressable
            accessibilityLabel={selectedMessage ? 'ویرایش' : 'ارسال'}
            disabled={!messageContent.trim()}
            onPress={handleSend}
            style={({pressed}) => [
              styles.sendButton,
              pressed && styles.sendButtonPressed,
              !messageContent.trim() && styles.sendButtonDisabled,
            ]}>
            {selectedMessage ? (
              <Edit2 color="#173800" size={21} />
            ) : (
              <Send color="#173800" size={21} />
            )}
            <Text style={styles.sendButtonText}>
              {selectedMessage ? 'ویرایش' : 'ارسال'}
            </Text>
          </Pressable>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop:40,
  },
  listContent: {
    flexGrow: 1,
    gap: styleVars.verticalSpacing,
    padding: styleVars.horizontalSpacing,
  },
  emptyList: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: styleVars.horizontalSpacing,
  },
  emptyText: {
    color: '#666',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.txtSize,
    textAlign: 'center',
  },
  dateBadge: {
    alignSelf: 'center',
    backgroundColor: '#e0e0e0',
    borderRadius: 100,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  dateText: {
    color: '#333',
    fontFamily: styleVars.fontFamily,
    fontSize: 12,
  },
  message: {
    maxWidth: '82%',
    minWidth: 100,
  },
  myMessage: {
    alignSelf: 'flex-end',
  },
  otherMessage: {
    alignSelf: 'flex-start',
  },
  messageBubble: {
    borderRadius: styleVars.radius,
    borderWidth: 1,
    paddingHorizontal: styleVars.horizontalSpacing,
    paddingVertical: styleVars.verticalSpacing,
  },
  myBubble: {
    backgroundColor: '#f1ffe6',
    borderBottomLeftRadius: 3,
    borderColor: '#d7ffc0',
  },
  otherBubble: {
    backgroundColor: '#f7f7f7',
    borderBottomRightRadius: 3,
    borderColor: '#eee',
  },
  messageText: {
    color: '#333',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.txtSize,
    writingDirection: 'rtl',
  },
  myMessageText: {
    color: '#173800',
  },
  messageInfo: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 3,
  },
  timeText: {
    color: '#858484',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.smallTxtSize,
  },
  messageActions: {
    flexDirection: 'row',
    gap: styleVars.gap * 2,
  },
  inputHolder: {
    backgroundColor: '#fff',
    borderTopColor: '#eee',
    borderTopWidth: 1,
    gap: styleVars.gap,
    padding: styleVars.horizontalSpacing,
  },
  editPreview: {
    alignItems: 'center',
    backgroundColor: '#f8fff2',
    borderColor: '#d7ffc0',
    borderRadius: styleVars.radius,
    borderRightColor: '#5a9e22',
    borderRightWidth: 4,
    borderWidth: 1,
    flexDirection: 'row',
    paddingHorizontal: styleVars.horizontalSpacing,
    paddingVertical: styleVars.gap,
  },
  editPreviewContent: {
    flex: 1,
  },
  editTitle: {
    color: '#376d0e',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.smallTxtSize,
    fontWeight: '600',
    textAlign: 'right',
  },
  editText: {
    color: '#555',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.smallTxtSize,
    textAlign: 'right',
  },
  cancelButton: {
    alignItems: 'center',
    height: 32,
    justifyContent: 'center',
    width: 32,
  },
  chatInput: {
    alignItems: 'flex-end',
    flexDirection: 'row-reverse',
    gap: styleVars.gap,
  },
  input: {
    borderColor: '#ddd',
    borderRadius: styleVars.radius,
    borderWidth: 1,
    flex: 1,
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.txtSize,
    maxHeight: 120,
    minHeight: 44,
    paddingHorizontal: styleVars.horizontalSpacing,
    paddingVertical: styleVars.gap,
    writingDirection: 'rtl',
  },
  sendButton: {
    alignItems: 'center',
    backgroundColor: '#f1ffe6',
    borderColor: '#c8ff99',
    borderRadius: styleVars.radius,
    borderWidth: 1,
    flexDirection: 'row-reverse',
    gap: 4,
    justifyContent: 'center',
    minHeight: 44,
    minWidth: 86,
    paddingHorizontal: styleVars.horizontalSpacing,
  },
  sendButtonPressed: {
    backgroundColor: '#e2ffc9',
  },
  sendButtonDisabled: {
    opacity: 0.45,
  },
  sendButtonText: {
    color: '#173800',
    fontFamily: styleVars.fontFamily,
    fontSize: styleVars.smallTxtSize,
    fontWeight: '600',
  },
});
