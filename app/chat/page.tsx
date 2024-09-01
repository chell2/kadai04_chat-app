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
import { FormEvent, useEffect, useState } from 'react';
import { getDatabase, onChildAdded, push, ref } from '@firebase/database';
import { FirebaseError } from '@firebase/util';

const Message = ({
  message,
  isOwnMessage,
}: {
  message: string;
  isOwnMessage: boolean;
}) => {
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
      {isOwnMessage ? <Avatar /> : null}
    </Flex>
  );
};

export default function ChatPage() {
  const [message, setMessage] = useState<string>('');

  const handleSendMessage = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const db = getDatabase();
      const dbRef = ref(db, 'chat');
      await push(dbRef, {
        message,
        user: 'user', // 任意の識別子
      });
      setMessage('');
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.log(e);
      }
    }
  };

  const [chats, setChats] = useState<{ message: string; user: string }[]>([]);

  useEffect(() => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, 'chat');
      return onChildAdded(dbRef, (snapshot) => {
        const data = snapshot.val();
        const message = String(data['message'] ?? '');
        const user = String(data['user'] ?? ''); // ユーザー識別子
        setChats((prev) => [...prev, { message, user }]);
      });
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 仮のユーザーIDを設定
  const currentUser = 'user'; // 現在ログインしているユーザーの識別子

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
      >
        {chats.map((chat, index) => (
          <Message
            message={chat.message}
            isOwnMessage={chat.user === currentUser}
            key={`ChatMessage_${index}`}
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
