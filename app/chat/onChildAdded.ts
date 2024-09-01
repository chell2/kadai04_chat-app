import { useEffect, useState } from 'react';
import { getDatabase, onChildAdded, ref } from '@firebase/database';
import { FirebaseError } from '@firebase/util';
import { getAuth } from 'firebase/auth';

export const App = () => {
  const [chats, setChats] = useState<{ message: string; senderId: string }[]>(
    []
  );
  const [userId, setUserId] = useState<string>('');

  useEffect(() => {
    // ユーザーIDを取得する
    const auth = getAuth();
    const currentUser = auth.currentUser;
    if (currentUser) {
      setUserId(currentUser.uid);
    }
  }, []);

  useEffect(() => {
    try {
      const db = getDatabase();
      const dbRef = ref(db, 'chat');
      return onChildAdded(dbRef, (snapshot) => {
        const value = snapshot.val();

        const senderId = value.senderId ?? '';
        setChats((prev) => [...prev, { message: value.message, senderId }]);
      });
    } catch (e) {
      if (e instanceof FirebaseError) {
        console.error(e);
      }
      return;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
};
