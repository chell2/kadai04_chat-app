'use client';

import {
  Avatar,
  Box,
  Button,
  Container,
  Flex,
  Heading,
  Input,
  Spacer,
  Text,
} from '@chakra-ui/react';
import { FormEvent, useEffect, useRef, useState } from 'react';
import { getDatabase, onChildAdded, push, ref } from '@firebase/database';
import { FirebaseError } from '@firebase/util';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

const Message = ({
  message,
  senderId,
  currentUserId,
}: {
  message: string;
  senderId: string;
  currentUserId: string | null;
}) => {
  const isOwnMessage = senderId === currentUserId;

  return (
    <Flex
      flexDirection={isOwnMessage ? 'row-reverse' : 'row'}
      alignItems="center"
      mb={2}
      gap={2}
    >
      {isOwnMessage ? null : <Avatar />}
      <Box
        className={`p-3 rounded-lg max-w-xs ${
          isOwnMessage ? 'bg-blue-500 text-white' : 'bg-gray-200'
        }`}
        style={{ borderRadius: '1rem' }}
      >
        <Text>{message}</Text>
      </Box>
    </Flex>
  );
};

export default function ChatPage() {
  const [message, setMessage] = useState<string>('');
  const [chats, setChats] = useState<{ message: string; userId: string }[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // チャットコンテナへの参照を作成（スクロール制御）
  const chatContainerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setCurrentUserId(user.uid);
      } else {
        setCurrentUserId(null);
      }
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      try {
        const db = getDatabase();
        const dbRef = ref(db, 'chat');
        return onChildAdded(dbRef, (snapshot) => {
          const data = snapshot.val();
          const message = String(data['message'] ?? '');
          const userId = String(data['senderId'] ?? '');
          setChats((prev) => [...prev, { message, userId }]);
        });
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.error(e);
        }
      }
    }
  }, [currentUserId]);

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (currentUserId) {
      try {
        const db = getDatabase();
        const dbRef = ref(db, 'chat');
        await push(dbRef, {
          message,
          senderId: currentUserId,
        });
        setMessage('');
      } catch (e) {
        if (e instanceof FirebaseError) {
          console.log(e);
        }
      }
    }
  };

  // メッセージが追加されるたびにスクロールを最下部に移動
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chats]);

  return (
    <Container py={14}>
      <Heading>Chat</Heading>
      <Spacer height={4} aria-hidden />
      <Flex
        flexDirection={'column'}
        overflowY={'auto'}
        gap={2}
        height={400}
        px={2}
        ref={chatContainerRef} // 参照を設定
      >
        {chats.map((chat, index) => (
          <Message
            message={chat.message}
            senderId={chat.userId}
            key={`ChatMessage_${index}`}
            currentUserId={currentUserId}
          />
        ))}
      </Flex>
      <Spacer height={2} aria-hidden />
      <form onSubmit={handleSendMessage} className="flex gap-2">
        <Input
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border rounded-lg"
        />
        <Button type={'submit'} colorScheme="blue">
          送信
        </Button>
      </form>
    </Container>
  );
}
